/**
 * run-ar-sanciones.ts
 * Descarga e inserta el dataset de Sanciones de Defensa del Consumidor (AR).
 * ~1,644 registros de empresas multadas — llena el gap de Argentina.
 *
 * Usage: npx tsx scripts/run-ar-sanciones.ts
 */

import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { scrapeAR_Sanciones } from "./lib/scrapers/ar-sanciones";
import { createClient } from "@supabase/supabase-js";

const BATCH_SIZE = 100;

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const cases = await scrapeAR_Sanciones();
  const deduped = [...new Map(cases.map((c) => [c.expediente_id, c])).values()];
  console.log(`📦 Total: ${cases.length} | Únicos: ${deduped.length}`);

  let inserted = 0;
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
      console.error(`❌ Error batch ${i}:`, error.message);
      errors += batch.length;
    } else {
      inserted += batch.length;
      process.stdout.write(`✓ ${inserted}/${deduped.length}\r`);
    }
  }

  console.log(`\n✅ Insertados: ${inserted} | ❌ Errores: ${errors}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
