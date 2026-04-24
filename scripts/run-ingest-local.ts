/**
 * run-ingest-local.ts
 * Runs the PROFECO ingestion directly without needing the Next.js server.
 * Equivalent to POST /api/admin/ingest-jurisprudencia but runs locally.
 *
 * Usage:
 *   npx tsx scripts/run-ingest-local.ts
 */

import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { createClient } from "@supabase/supabase-js";
import { streamProfecoData } from "../src/lib/providers/profeco";

const SINCE_DATE = "2023/01/01";
const INGEST_LIMIT = 2000;
const BATCH_SIZE = 100;

const RELEVANT_SECTORS = new Set([
  "TELECOMUNICACIONES",
  "FINANCIERO",
  "TIENDA DEPARTAMENTAL",
  "ELECTRODOMÉSTICOS",
  "TURÍSTICO",
]);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function main() {
  console.log("🚀 Iniciando ingesta PROFECO...");
  console.log(`   Desde: ${SINCE_DATE} | Límite: ${INGEST_LIMIT} registros`);

  const allCases = await streamProfecoData({
    since: SINCE_DATE,
    limit: INGEST_LIMIT,
  });

  const filtered = allCases.filter((c) =>
    [...RELEVANT_SECTORS].some((s) => c.hechos.toUpperCase().includes(s))
  );

  // Deduplicate by expediente_id — CSV can contain repeated rows
  const deduped = [...new Map(filtered.map((c) => [c.expediente_id, c])).values()];

  console.log(`📦 Descargados: ${allCases.length} | Filtrados: ${filtered.length} | Únicos: ${deduped.length}`);

  let ingested = 0;
  let errors = 0;

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
      console.error(`❌ Error en batch ${i}-${i + BATCH_SIZE}:`, error.message);
      errors += batch.length;
    } else {
      ingested += batch.length;
      process.stdout.write(`✓ ${ingested}/${deduped.length}\r`);
    }
  }

  console.log(`\n✅ Ingesta completa: ${ingested} registros | ❌ Errores: ${errors}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
