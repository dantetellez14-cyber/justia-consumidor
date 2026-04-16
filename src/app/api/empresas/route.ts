/**
 * GET /api/empresas
 *
 * Returns a ranked list of companies with reputation scores derived from:
 *   1. `cases` table (consumer complaints submitted via this platform)
 *   2. `complaint_stats` table (official PROFECO/Defensa data)
 *
 * Query params:
 *   pais  "AR" | "MX" | "both"  (default: "both")
 *   search  string               (optional company name filter)
 *   limit   number               (default: 20, max: 50)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { calculateReputationScore } from "@/lib/reputation-score";
import type { CompanyStats, SectorStats } from "@/lib/complaint-stats";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logError, createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/empresas");

// ── Types ──────────────────────────────────────────────────────────────────────

export interface EmpresaRanking {
  readonly empresa: string;
  readonly pais: "AR" | "MX";
  readonly sector: string | null;
  /** Cases submitted via this platform */
  readonly total_casos_plataforma: number;
  readonly probabilidad_exito_promedio: number | null;
  readonly monto_reclamo_promedio: number | null;
  /** Official complaint count from PROFECO / Defensa del Consumidor */
  readonly total_quejas_oficiales: number | null;
  readonly tasa_resolucion: number | null;
  readonly reputation: {
    readonly score: number;
    readonly level: string;
    readonly veredicto: string;
    readonly color: string;
    readonly dimensions: {
      readonly resolucion: number;
      readonly recuperacion: number;
      readonly volumen: number;
      readonly resultado: number;
    };
  } | null;
}

// ── Validation ─────────────────────────────────────────────────────────────────

const querySchema = z.object({
  pais: z.enum(["AR", "MX", "both"]).default("both"),
  search: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ── Helpers ────────────────────────────────────────────────────────────────────

interface PlatformCaseRow {
  empresa: string | null;
  pais_detectado: "AR" | "MX" | null;
  monto_reclamo: number | null;
  probabilidad_exito: number | null;
}

interface AggregatedCompany {
  empresa: string;
  pais: "AR" | "MX";
  total_casos: number;
  probabilidad_exito_sum: number;
  probabilidad_exito_count: number;
  monto_reclamo_sum: number;
  monto_reclamo_count: number;
}

function aggregateCases(rows: PlatformCaseRow[]): AggregatedCompany[] {
  const map = new Map<string, AggregatedCompany>();

  for (const row of rows) {
    if (!row.empresa || !row.pais_detectado) continue;

    const key = `${row.empresa.toLowerCase().trim()}::${row.pais_detectado}`;
    const existing = map.get(key);

    if (existing) {
      existing.total_casos += 1;
      if (row.probabilidad_exito !== null) {
        existing.probabilidad_exito_sum += row.probabilidad_exito;
        existing.probabilidad_exito_count += 1;
      }
      if (row.monto_reclamo !== null) {
        existing.monto_reclamo_sum += row.monto_reclamo;
        existing.monto_reclamo_count += 1;
      }
    } else {
      map.set(key, {
        empresa: row.empresa.trim(),
        pais: row.pais_detectado,
        total_casos: 1,
        probabilidad_exito_sum: row.probabilidad_exito ?? 0,
        probabilidad_exito_count: row.probabilidad_exito !== null ? 1 : 0,
        monto_reclamo_sum: row.monto_reclamo ?? 0,
        monto_reclamo_count: row.monto_reclamo !== null ? 1 : 0,
      });
    }
  }

  return Array.from(map.values());
}

// ── Handler ────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  log.info(
    { url: request.url, method: request.method },
    "Empresas ranking request received"
  );

  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`empresas-ranking:${ip}`, {
    limit: 30,
    windowSeconds: 60,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta de nuevo en ${resetIn} segundos.` },
      { status: 429 }
    );
  }

  const rawParams = {
    pais: request.nextUrl.searchParams.get("pais") ?? "both",
    search: request.nextUrl.searchParams.get("search") ?? undefined,
    limit: request.nextUrl.searchParams.get("limit") ?? "20",
  };

  const parsed = querySchema.safeParse(rawParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { pais, search, limit } = parsed.data;

  try {
    // ── 1. Pull platform cases ────────────────────────────────────────────────
    let casesQuery = supabase
      .from("cases")
      .select("empresa, pais_detectado, monto_reclamo, probabilidad_exito")
      .not("empresa", "is", null)
      .neq("empresa", "");

    if (pais !== "both") {
      casesQuery = casesQuery.eq("pais_detectado", pais);
    }

    const { data: caseRows, error: casesError } = await casesQuery;

    if (casesError) {
      logError("Error fetching cases for empresas ranking", casesError);
    }

    const aggregated = aggregateCases((caseRows ?? []) as PlatformCaseRow[]);

    // ── 2. Pull official complaint_stats ──────────────────────────────────────
    let statsQuery = supabase
      .from("complaint_stats")
      .select(
        "empresa, sector, pais, total_quejas, tasa_resolucion, monto_promedio_reclamado, monto_promedio_recuperado, quejas_conciliadas, quejas_no_conciliadas, periodo, fuente"
      )
      .order("total_quejas", { ascending: false })
      .limit(200);

    if (pais !== "both") {
      statsQuery = statsQuery.eq("pais", pais);
    }

    const { data: statsRows } = await statsQuery;
    const statsMap = new Map<string, CompanyStats>();
    for (const row of statsRows ?? []) {
      const key = `${(row.empresa as string).toLowerCase().trim()}::${row.pais}`;
      statsMap.set(key, row as CompanyStats);
    }

    // ── 3. Pull sector stats for scoring context ──────────────────────────────
    const { data: sectorRows } = await supabase
      .from("sector_stats")
      .select("*");
    const sectorMap = new Map<string, SectorStats>();
    for (const row of sectorRows ?? []) {
      const key = `${(row.sector as string).toLowerCase()}::${row.pais}`;
      sectorMap.set(key, row as SectorStats);
    }

    // ── 4. Merge platform + official data ─────────────────────────────────────
    const merged = new Map<string, EmpresaRanking>();

    // Add platform companies
    for (const agg of aggregated) {
      const key = `${agg.empresa.toLowerCase()}::${agg.pais}`;
      const officialStats = statsMap.get(key);
      const sector = officialStats?.sector ?? null;

      // Build CompanyStats shape for scoring
      const companyStats: CompanyStats = officialStats ?? {
        empresa: agg.empresa,
        sector: sector ?? "otro",
        pais: agg.pais,
        total_quejas: agg.total_casos,
        quejas_conciliadas: 0,
        quejas_no_conciliadas: agg.total_casos,
        monto_promedio_reclamado: agg.monto_reclamo_count > 0
          ? agg.monto_reclamo_sum / agg.monto_reclamo_count
          : null,
        monto_promedio_recuperado: null,
        tasa_resolucion: null,
        periodo: "plataforma",
        fuente: "JustIA",
      };

      const sectorKey = `${(sector ?? "otro").toLowerCase()}::${agg.pais}`;
      const sectorStats = sectorMap.get(sectorKey) ?? null;
      const reputation = calculateReputationScore(companyStats, sectorStats);

      merged.set(key, {
        empresa: agg.empresa,
        pais: agg.pais,
        sector,
        total_casos_plataforma: agg.total_casos,
        probabilidad_exito_promedio: agg.probabilidad_exito_count > 0
          ? Math.round((agg.probabilidad_exito_sum / agg.probabilidad_exito_count) * 100) / 100
          : null,
        monto_reclamo_promedio: agg.monto_reclamo_count > 0
          ? Math.round(agg.monto_reclamo_sum / agg.monto_reclamo_count)
          : null,
        total_quejas_oficiales: officialStats?.total_quejas ?? null,
        tasa_resolucion: officialStats?.tasa_resolucion ?? null,
        reputation,
      });
    }

    // Add companies that are in official stats but not on platform yet
    for (const [key, official] of statsMap.entries()) {
      if (merged.has(key)) continue;

      const sectorKey = `${official.sector.toLowerCase()}::${official.pais}`;
      const sectorStats = sectorMap.get(sectorKey) ?? null;
      const reputation = calculateReputationScore(official, sectorStats);

      merged.set(key, {
        empresa: official.empresa,
        pais: official.pais as "AR" | "MX",
        sector: official.sector,
        total_casos_plataforma: 0,
        probabilidad_exito_promedio: null,
        monto_reclamo_promedio: official.monto_promedio_reclamado
          ? Math.round(official.monto_promedio_reclamado)
          : null,
        total_quejas_oficiales: official.total_quejas,
        tasa_resolucion: official.tasa_resolucion,
        reputation,
      });
    }

    // ── 5. Filter by search term ──────────────────────────────────────────────
    let results = Array.from(merged.values());

    if (search && search.trim().length > 0) {
      const term = search.toLowerCase().trim();
      results = results.filter((r) =>
        r.empresa.toLowerCase().includes(term) ||
        r.sector?.toLowerCase().includes(term)
      );
    }

    // ── 6. Sort by total complaints (platform + official), then by score ──────
    results.sort((a, b) => {
      const totalA = a.total_casos_plataforma + (a.total_quejas_oficiales ?? 0);
      const totalB = b.total_casos_plataforma + (b.total_quejas_oficiales ?? 0);
      if (totalB !== totalA) return totalB - totalA;
      // Secondary sort: lower reputation score first (worse companies rank higher — more relevant)
      const scoreA = a.reputation?.score ?? 5;
      const scoreB = b.reputation?.score ?? 5;
      return scoreA - scoreB;
    });

    results = results.slice(0, limit);

    log.info(
      { pais, search, limit, returned: results.length },
      "Empresas ranking built"
    );

    return NextResponse.json(
      { empresas: results, total: results.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err) {
    logError("Error building empresas ranking", err, { route: "/api/empresas" });
    return NextResponse.json(
      { error: "Error al cargar el ranking de empresas." },
      { status: 500 }
    );
  }
}
