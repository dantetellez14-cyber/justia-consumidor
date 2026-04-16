import { scrapeMX_SCJN } from "./lib/scrapers/mx-scjn";
import * as fs from "fs";
import * as path from "path";

const QUERIES = [
  "consumidor proteccion LFPC PROFECO",
  "garantia consumidor productos defectuosos",
  "practicas comerciales engañosas consumidor",
  "daños perjuicios consumidor derechos",
  "contrato adhesion consumidor cláusulas",
];

async function main() {
  const dataPath = path.resolve(__dirname, "../data/jurisprudencia.json");

  for (const query of QUERIES) {
    const existing = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    const existingIds = new Set(existing.map((c: { expediente_id: string }) => c.expediente_id));

    console.log(`\n[bulk] === Query: "${query}" ===`);
    console.log(`[bulk] Existing cases: ${existing.length}`);

    const scraped = await scrapeMX_SCJN(40, query);
    const newCases = scraped.filter(c => !existingIds.has(c.expediente_id));

    if (newCases.length === 0) {
      console.log("[bulk] No new cases from this query, skipping.");
      continue;
    }

    const merged = [...existing, ...newCases];
    fs.writeFileSync(dataPath, JSON.stringify(merged, null, 2));
    console.log(`[bulk] +${newCases.length} new cases → total: ${merged.length}`);
    newCases.forEach(c => console.log(`  + ${c.expediente_id}`));

    if (merged.length >= 100) {
      console.log("[bulk] Reached 100+ cases, stopping.");
      break;
    }
  }

  const final = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  console.log(`\n[bulk] Final dataset size: ${final.length} cases`);
}

main().catch(console.error);
