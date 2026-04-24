/**
 * POST /api/admin/ingest-jurisprudencia
 *
 * Ingests recent PROFECO data into the `jurisprudencia_cases` Supabase table.
 *
 * Security: requires `Authorization: Bearer ${CRON_SECRET}` header.
 * Rate-limit: one run per hour enforced via a Supabase/Redis flag.
 *
 * Vercel cron fires every Monday at 03:00 UTC (see vercel.json).
 */

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { streamProfecoData } from "@/lib/providers/profeco";
import { logError, createRouteLogger } from "@/lib/logger";
import { cacheGet, cacheSet } from "@/lib/cache";

const log = createRouteLogger("/api/admin/ingest-jurisprudencia");

// Only ingest data from the last ~3 years
const SINCE_DATE = "2023/01/01";

// Relevant PROFECO sectors for JustIA Consumidor
const RELEVANT_SECTORS = new Set([
  "TELECOMUNICACIONES",
  "FINANCIERO",
  "TIENDA DEPARTAMENTAL",
  "ELECTRODOMÉSTICOS",
  "TURÍSTICO",
]);

// Ingest at most 2 000 records per run to stay within Vercel function limits
const INGEST_LIMIT = 2000;

// Supabase upsert batch size
const BATCH_SIZE = 100;

// Cache key used as a "lock" to prevent concurrent/back-to-back runs
const LOCK_KEY = "ingest:profeco:last_run";
const LOCK_TTL = 3600; // 1 hour

// ── Auth helper ──────────────────────────────────────────────────────────────

function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // One-run-per-hour guard
  const lastRun = await cacheGet<number>(LOCK_KEY);
  if (lastRun !== null) {
    const secondsAgo = Math.floor((Date.now() - lastRun) / 1000);
    return NextResponse.json(
      {
        error: `Ingest already ran ${secondsAgo}s ago. Try again in ${LOCK_TTL - secondsAgo}s.`,
      },
      { status: 429 }
    );
  }

  // Acquire lock immediately so concurrent calls are rejected
  await cacheSet(LOCK_KEY, Date.now(), LOCK_TTL);

  log.info({ since: SINCE_DATE, limit: INGEST_LIMIT }, "PROFECO ingest started");

  let ingested = 0;
  let errors = 0;

  try {
    const allCases = await streamProfecoData({
      since: SINCE_DATE,
      limit: INGEST_LIMIT,
    });

    // Filter to relevant sectors
    const filtered = allCases.filter((c) =>
      [...RELEVANT_SECTORS].some((s) => c.hechos.toUpperCase().includes(s))
    );

    // Deduplicate by expediente_id — CSV can contain repeated rows within the same pull
    const deduped = [...new Map(filtered.map((c) => [c.expediente_id, c])).values()];

    log.info(
      { total: allCases.length, afterFilter: filtered.length, afterDedup: deduped.length },
      "Records fetched from PROFECO"
    );

    // Upsert in batches
    for (let i = 0; i < deduped.length; i += BATCH_SIZE) {
      const batch = deduped.slice(i, i + BATCH_SIZE).map((c) => ({
        expediente_id: c.expediente_id,
        hechos: c.hechos,
        ratio_decidendi: c.ratio_decidendi,
        probabilidad_exito: c.probabilidad_exito,
        duracion_dias: c.duracion_dias,
        pais: c.pais,
        normalizado_por_ia: false,
      }));

      const { error } = await supabase
        .from("jurisprudencia_cases")
        .upsert(batch, { onConflict: "expediente_id" });

      if (error) {
        logError("Supabase upsert error", error, {
          route: "/api/admin/ingest-jurisprudencia",
          batchStart: i,
        });
        errors += batch.length;
      } else {
        ingested += batch.length;
      }
    }
  } catch (err) {
    logError("PROFECO ingest failed", err, {
      route: "/api/admin/ingest-jurisprudencia",
    });
    return NextResponse.json(
      { error: "Ingest failed", ingested, errors },
      { status: 500 }
    );
  }

  log.info({ ingested, errors }, "PROFECO ingest complete");

  return NextResponse.json({ ingested, errors });
}
