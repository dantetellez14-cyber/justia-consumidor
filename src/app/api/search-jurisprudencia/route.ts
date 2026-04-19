import { NextResponse } from "next/server";
import { getPinecone, PINECONE_INDEX_NAME } from "@/lib/pinecone";
import type { JurisprudenciaCase } from "@/lib/types";
import {
  searchJurisprudenciaSchema,
  formatZodError,
} from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";
import { cached } from "@/lib/cache";
import { supabase } from "@/lib/supabase";

const EMBEDDING_MODEL = "multilingual-e5-large";
const TOP_K = 5;
const SUPABASE_TOP_K = 5;

// ── Supabase full-text helper ─────────────────────────────────────────────────

/**
 * Extract a short keyword from the query to use as an ILIKE pattern.
 * Takes the longest word (>3 chars) that looks like a company/sector name.
 */
function extractKeyword(query: string): string {
  const words = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  // Prefer the longest word as the most likely company/sector identifier
  return words.sort((a, b) => b.length - a.length)[0] ?? query.slice(0, 30);
}

async function searchSupabase(
  query: string,
  pais?: string
): Promise<JurisprudenciaCase[]> {
  const keyword = extractKeyword(query);
  const ilike = `%${keyword}%`;

  let q = supabase
    .from("jurisprudencia_cases")
    .select(
      "expediente_id, hechos, ratio_decidendi, probabilidad_exito, duracion_dias, pais"
    )
    .or(`hechos.ilike.${ilike},ratio_decidendi.ilike.${ilike}`)
    .order("probabilidad_exito", { ascending: false })
    .limit(SUPABASE_TOP_K);

  if (pais) {
    q = q.eq("pais", pais);
  }

  const { data, error } = await q;

  if (error) {
    logError("Supabase jurisprudencia search error", error, {
      route: "/api/search-jurisprudencia",
    });
    return [];
  }

  return (data ?? []).map((row) => ({
    expediente_id: String(row.expediente_id),
    hechos: String(row.hechos ?? ""),
    ratio_decidendi: String(row.ratio_decidendi ?? ""),
    probabilidad_exito: Number(row.probabilidad_exito ?? 0),
    duracion_dias: Number(row.duracion_dias ?? 0),
    pais: (row.pais === "MX" ? "MX" : "AR") as "AR" | "MX",
  }));
}

/** Merge Pinecone + Supabase results, deduplicate, sort by probabilidad_exito desc. */
function mergeResults(
  pinecone: JurisprudenciaCase[],
  supabaseRows: JurisprudenciaCase[]
): JurisprudenciaCase[] {
  const seen = new Set<string>(pinecone.map((c) => c.expediente_id));
  const unique = [
    ...pinecone,
    ...supabaseRows.filter((c) => !seen.has(c.expediente_id)),
  ];
  return unique.sort((a, b) => b.probabilidad_exito - a.probabilidad_exito);
}

export async function POST(request: Request) {
  // Rate limit: 15 searches per minute per IP
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`search:${ip}`, {
    limit: 15,
    windowSeconds: 60,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta de nuevo en ${resetIn} segundos.` },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido." },
      { status: 400 }
    );
  }

  const parsed = searchJurisprudenciaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  const { query, pais } = parsed.data;

  // Cache key: normalize query to first 100 chars + country — 24h TTL
  const normalizedQuery = query.toLowerCase().trim().slice(0, 100);
  const cacheKey = `juris:${normalizedQuery}:${pais ?? "all"}`;

  if (!process.env.PINECONE_API_KEY) {
    // No Pinecone — query Supabase only
    try {
      const supabaseCases = await cached(cacheKey, 86400, () =>
        searchSupabase(query, pais)
      );
      return NextResponse.json(
        { cases: supabaseCases, source: "supabase" },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=86400, stale-while-revalidate=43200",
          },
        }
      );
    } catch (err) {
      logError("Supabase-only search error", err, {
        route: "/api/search-jurisprudencia",
      });
      return NextResponse.json({ cases: [], source: "error" });
    }
  }

  try {
    const result = await cached(cacheKey, 86400, async () => {
      const pc = getPinecone();

      const embedResponse = await pc.inference.embed({
        model: EMBEDDING_MODEL,
        inputs: [query],
        parameters: { inputType: "query" },
      });
      const embedding = embedResponse.data[0];
      if (embedding.vectorType !== "dense") {
        throw new Error("Expected dense embedding");
      }
      const queryVector = embedding.values;

      const index = pc.index(PINECONE_INDEX_NAME);
      const filter = pais ? { pais: { $eq: pais } } : undefined;

      const [pineconeResults, supabaseCases] = await Promise.all([
        index.query({
          vector: queryVector,
          topK: TOP_K,
          includeMetadata: true,
          filter,
        }),
        searchSupabase(query, pais),
      ]);

      const pineconeCases: JurisprudenciaCase[] = (
        pineconeResults.matches ?? []
      ).map((match) => {
        const meta = match.metadata as Record<string, unknown>;
        return {
          expediente_id: String(meta.expediente_id ?? ""),
          hechos: String(meta.hechos ?? ""),
          ratio_decidendi: String(meta.ratio_decidendi ?? ""),
          probabilidad_exito: Number(meta.probabilidad_exito ?? 0),
          duracion_dias: Number(meta.duracion_dias ?? 0),
          pais: (meta.pais === "MX" ? "MX" : "AR") as "AR" | "MX",
        };
      });

      const merged = mergeResults(pineconeCases, supabaseCases);

      return {
        cases: merged,
        source: "pinecone+supabase" as const,
        scores: (pineconeResults.matches ?? []).map((m) => m.score),
      };
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (err) {
    logError("Search error", err, { route: "/api/search-jurisprudencia" });
    return NextResponse.json({ cases: [], source: "error" });
  }
}
