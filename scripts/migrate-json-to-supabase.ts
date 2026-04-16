/**
 * migrate-json-to-supabase.ts
 * ONE-TIME script: loads all cases from data/jurisprudencia.json into Supabase.
 *
 * Safe to re-run — uses UPSERT so existing rows are updated, not duplicated.
 *
 * Usage:
 *   npx tsx scripts/migrate-json-to-supabase.ts
 *   npx tsx scripts/migrate-json-to-supabase.ts --dry-run   # preview without writing
 */

import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import {
  readJurisprudenciaJSON,
  upsertCasesToDB,
} from "./lib/jurisprudencia-io";

const DRY_RUN = process.argv.includes("--dry-run");

async function main(): Promise<void> {
  const cases = readJurisprudenciaJSON();

  console.log(`[migrate] Loaded ${cases.length} cases from data/jurisprudencia.json`);

  if (cases.length === 0) {
    console.log("[migrate] Nothing to migrate.");
    return;
  }

  if (DRY_RUN) {
    console.log("[migrate] DRY RUN — no data will be written to Supabase.");
    for (const c of cases.slice(0, 5)) {
      console.log(
        `  • ${c.expediente_id} | pais=${c.pais} | normalizado=${c.normalizado_por_ia} | prob=${c.probabilidad_exito}`
      );
    }
    if (cases.length > 5) {
      console.log(`  … and ${cases.length - 5} more`);
    }
    return;
  }

  console.log("[migrate] Upserting to Supabase (batches of 50)...");
  const processed = await upsertCasesToDB(cases, 50);

  console.log(`[migrate] Done. ${processed} cases upserted to jurisprudencia_cases.`);
  console.log(
    "[migrate] You can now add data/jurisprudencia.json to .gitignore."
  );
}

main().catch((err) => {
  console.error("[migrate] Fatal error:", err);
  process.exit(1);
});
