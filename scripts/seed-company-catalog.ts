/**
 * seed-company-catalog.ts
 * Seeds the company_accounts table from Reclame AQUI AR + MX scrapers.
 *
 * Only inserts companies that don't already exist (matched by nombre_normalizado + pais).
 * Existing verified companies are never overwritten.
 *
 * Usage:
 *   npx tsx scripts/seed-company-catalog.ts [--dry-run] [--country=AR|MX]
 *
 * Env vars required (loaded from .env.local automatically):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SECRET_KEY
 */

import { loadEnvConfig } from "@next/env";
import { getAdminClient } from "./lib/supabase-client";
import { scrapeReclameAquiAR, type ScrapedCompany } from "./lib/scrapers/reclame-aqui-ar";
import { scrapeReclameAquiMX } from "./lib/scrapers/reclame-aqui-mx";

// ─── Config ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const COUNTRY_FILTER = args.find((a) => a.startsWith("--country="))?.split("=")[1]?.toUpperCase() as
  | "AR"
  | "MX"
  | undefined;

// ─── Normalize ─────────────────────────────────────────────────────────────────

function normalizeEmpresaName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,\-()]/g, "")
    .replace(/\b(s\.?a\.?|s\.?r\.?l\.?|s\.?a\.?s\.?|s\.? de c\.?v\.?)\b/gi, "")
    .replace(/\b(argentina|m[eé]xico|de|del|la|el|los|las)\b/gi, "")
    .trim();
}

// ─── Insert logic ──────────────────────────────────────────────────────────────

interface InsertRow {
  nombre: string;
  nombre_normalizado: string;
  sector: string | null;
  pais: "AR" | "MX";
  activa: boolean;
}

async function seedCountry(
  companies: ScrapedCompany[],
  pais: "AR" | "MX"
): Promise<{ inserted: number; skipped: number; errors: number }> {
  const supabase = getAdminClient();
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  // Load existing normalized names for this country
  const { data: existing, error: fetchErr } = await supabase
    .from("company_accounts")
    .select("nombre_normalizado")
    .eq("pais", pais);

  if (fetchErr) {
    console.error(`[seed] Failed to fetch existing ${pais} companies:`, fetchErr.message);
    return { inserted: 0, skipped: 0, errors: 1 };
  }

  const existingNorm = new Set(
    (existing ?? []).map((r: { nombre_normalizado: string }) => r.nombre_normalizado)
  );
  console.log(`[seed-${pais}] ${existingNorm.size} companies already in DB`);

  // Build rows to insert
  const toInsert: InsertRow[] = [];

  for (const c of companies) {
    const normalized = normalizeEmpresaName(c.nombre);
    if (!normalized || normalized.length < 2) {
      skipped++;
      continue;
    }

    if (existingNorm.has(normalized)) {
      skipped++;
      continue;
    }

    // Avoid duplicates within this batch
    existingNorm.add(normalized);

    toInsert.push({
      nombre: c.nombre.trim(),
      nombre_normalizado: normalized,
      sector: c.sector ? c.sector.trim() : null,
      pais,
      activa: true,
    });
  }

  console.log(
    `[seed-${pais}] ${toInsert.length} new companies to insert, ${skipped} skipped (already exist or invalid)`
  );

  if (DRY_RUN) {
    console.log(`[seed-${pais}] DRY RUN — sample of rows that would be inserted:`);
    toInsert.slice(0, 5).forEach((r) =>
      console.log(`  • ${r.nombre} | norm: "${r.nombre_normalizado}" | sector: ${r.sector ?? "—"}`)
    );
    return { inserted: 0, skipped, errors: 0 };
  }

  // Insert in batches of 50
  const BATCH_SIZE = 50;
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const { error: insertErr, data } = await supabase
      .from("company_accounts")
      .insert(batch)
      .select("id");

    if (insertErr) {
      console.error(`[seed-${pais}] Batch ${i / BATCH_SIZE + 1} error:`, insertErr.message);
      errors += batch.length;
    } else {
      const count = (data ?? []).length;
      inserted += count;
      console.log(
        `[seed-${pais}] Batch ${i / BATCH_SIZE + 1}: inserted ${count} companies`
      );
    }
  }

  return { inserted, skipped, errors };
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  loadEnvConfig(process.cwd());

  console.log("=".repeat(60));
  console.log("JustIA Consumidor — Company Catalog Seeder");
  if (DRY_RUN) console.log("MODE: DRY RUN (no writes)");
  if (COUNTRY_FILTER) console.log(`FILTER: ${COUNTRY_FILTER} only`);
  console.log("=".repeat(60));

  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  // ── Argentina ──
  if (!COUNTRY_FILTER || COUNTRY_FILTER === "AR") {
    const arCompanies = await scrapeReclameAquiAR(true);
    console.log(`\n[AR] ${arCompanies.length} companies to process`);
    const { inserted, skipped, errors } = await seedCountry(arCompanies, "AR");
    totalInserted += inserted;
    totalSkipped += skipped;
    totalErrors += errors;
    console.log(`[AR] Done: +${inserted} inserted, ${skipped} skipped, ${errors} errors`);
  }

  // ── Mexico ──
  if (!COUNTRY_FILTER || COUNTRY_FILTER === "MX") {
    const mxCompanies = await scrapeReclameAquiMX(true);
    console.log(`\n[MX] ${mxCompanies.length} companies to process`);
    const { inserted, skipped, errors } = await seedCountry(mxCompanies, "MX");
    totalInserted += inserted;
    totalSkipped += skipped;
    totalErrors += errors;
    console.log(`[MX] Done: +${inserted} inserted, ${skipped} skipped, ${errors} errors`);
  }

  // ── Summary ──
  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log(`  Inserted : ${totalInserted}`);
  console.log(`  Skipped  : ${totalSkipped}`);
  console.log(`  Errors   : ${totalErrors}`);
  console.log("=".repeat(60));

  if (totalErrors > 0) process.exit(1);
}

main().catch((err) => {
  console.error("[seed] Fatal error:", err);
  process.exit(1);
});
