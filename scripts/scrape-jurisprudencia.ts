/**
 * scrape-jurisprudencia.ts
 * Orchestrates all source scrapers and merges new cases into Supabase.
 *
 * Usage:
 *   npx tsx scripts/scrape-jurisprudencia.ts
 *
 * No API keys required — only fetches from public portals.
 */

import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import {
  readJurisprudenciaDB,
  mergeNewCases,
  upsertCasesToDB,
} from "./lib/jurisprudencia-io";
import { scrapeAR_SAIJ } from "./lib/scrapers/ar-saij";
import { scrapeAR_BoletinOficial } from "./lib/scrapers/ar-boletin";
import { scrapeAR_CSJN } from "./lib/scrapers/ar-csjn";
import { scrapeAR_DESCAjus } from "./lib/scrapers/ar-descajus";
import { scrapeAR_Sanciones } from "./lib/scrapers/ar-sanciones";
import { scrapeMX_SJF2 } from "./lib/scrapers/mx-sjf2";
import { scrapeMX_SCJN } from "./lib/scrapers/mx-scjn";

async function main(): Promise<void> {
  console.log("[scrape] Starting jurisprudencia pipeline...");

  const existing = await readJurisprudenciaDB();
  console.log(`[scrape] Loaded ${existing.length} existing cases from Supabase`);

  const scrapers = [
    { name: "AR-SAIJ",           fn: () => scrapeAR_SAIJ(4) },
    { name: "AR-BoletinOficial", fn: () => scrapeAR_BoletinOficial(4) },
    { name: "AR-CSJN",           fn: () => scrapeAR_CSJN() },
    { name: "AR-DESCAjus",       fn: () => scrapeAR_DESCAjus() },
    { name: "AR-Sanciones",      fn: () => scrapeAR_Sanciones() },
    { name: "MX-SJF2",           fn: () => scrapeMX_SJF2(4) },
    { name: "MX-SCJN",           fn: () => scrapeMX_SCJN(3) },
  ];

  const allIncoming = [];
  const summary: Record<string, number> = {};

  for (const { name, fn } of scrapers) {
    console.log(`\n[scrape] Running ${name}...`);
    try {
      const cases = await fn();
      summary[name] = cases.length;
      allIncoming.push(...cases);
      console.log(`[scrape] ${name}: ${cases.length} cases fetched`);
    } catch (err) {
      summary[name] = 0;
      console.warn(
        `[scrape] ${name} failed:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  const { merged, newCount } = mergeNewCases(existing, allIncoming);

  if (newCount === 0) {
    console.log("\n[scrape] No new cases found. Supabase unchanged.");
  } else {
    const newCases = merged.slice(existing.length);
    await upsertCasesToDB(newCases);
    console.log(
      `\n[scrape] Upserted ${newCount} new cases to Supabase (${merged.length} total)`
    );
  }

  console.log("\n[scrape] Summary by source:");
  for (const [name, count] of Object.entries(summary)) {
    console.log(`  ${name}: ${count}`);
  }
  console.log(`  Total fetched: ${allIncoming.length}`);
  console.log(`  New (after dedup): ${newCount}`);
  console.log(`  Grand total in Supabase: ${merged.length}`);
}

main().catch((err) => {
  console.error("[scrape] Fatal:", err);
  process.exit(1);
});
