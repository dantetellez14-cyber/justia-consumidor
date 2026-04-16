/**
 * jurisprudencia-io.ts
 * Async Supabase IO for the jurisprudencia_cases table.
 *
 * Primary API (async, Supabase-backed):
 *   readJurisprudenciaDB()               → all cases
 *   readUnnormalizedFromDB()             → cases needing AI normalization
 *   upsertCaseToDB(case)                 → upsert one case
 *   upsertCasesToDB(cases, batchSize)    → upsert many cases in batches
 *
 * Pure utility (no I/O):
 *   mergeNewCases(existing, incoming)    → dedup by expediente_id
 *
 * Legacy JSON helpers (kept for scripts/migrate-json-to-supabase.ts only):
 *   readJurisprudenciaJSON(filePath?)    → read from JSON file
 *   writeJurisprudenciaJSON(cases, fp?)  → write to JSON file
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import type { JurisprudenciaCaseExtended } from "../../src/lib/types";
import { getAdminClient } from "./supabase-client";

// ── Constants ────────────────────────────────────────────────────────────────

const TABLE = "jurisprudencia_cases";
const DEFAULT_DATA_FILE = resolve(process.cwd(), "data/jurisprudencia.json");
const DEFAULT_BATCH_SIZE = 50;

// ── Validation schema (minimal — full validation in normalize step) ───────────

const casesArraySchema = z.array(
  z.object({ expediente_id: z.string() }).passthrough()
);

// ── Async Supabase API ────────────────────────────────────────────────────────

/**
 * Reads all cases from Supabase.
 */
export async function readJurisprudenciaDB(): Promise<JurisprudenciaCaseExtended[]> {
  const supabase = getAdminClient();

  // Paginate to avoid hitting the 1000-row default limit
  const PAGE = 1000;
  let offset = 0;
  const all: JurisprudenciaCaseExtended[] = [];

  while (true) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .range(offset, offset + PAGE - 1)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`[jurisprudencia-io] readJurisprudenciaDB failed: ${error.message}`);
    }

    if (!data || data.length === 0) break;

    all.push(...(data as unknown as JurisprudenciaCaseExtended[]));

    if (data.length < PAGE) break;
    offset += PAGE;
  }

  return all;
}

/**
 * Reads only cases that have not yet been normalized by AI.
 * Uses `texto_crudo IS NOT NULL AND texto_crudo != ''` to skip empty-text cases.
 */
export async function readUnnormalizedFromDB(): Promise<JurisprudenciaCaseExtended[]> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("normalizado_por_ia", false)
    .neq("texto_crudo", "")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(
      `[jurisprudencia-io] readUnnormalizedFromDB failed: ${error.message}`
    );
  }

  return (data ?? []) as unknown as JurisprudenciaCaseExtended[];
}

/**
 * Upserts a single case (INSERT or UPDATE by expediente_id).
 */
export async function upsertCaseToDB(
  caseItem: JurisprudenciaCaseExtended
): Promise<void> {
  const supabase = getAdminClient();

  const { error } = await supabase
    .from(TABLE)
    .upsert(caseItem, { onConflict: "expediente_id" });

  if (error) {
    throw new Error(
      `[jurisprudencia-io] upsertCaseToDB failed for ${caseItem.expediente_id}: ${error.message}`
    );
  }
}

/**
 * Upserts many cases in batches.
 * Returns the count of rows processed.
 */
export async function upsertCasesToDB(
  cases: JurisprudenciaCaseExtended[],
  batchSize: number = DEFAULT_BATCH_SIZE
): Promise<number> {
  if (cases.length === 0) return 0;

  const supabase = getAdminClient();
  let processed = 0;

  for (let i = 0; i < cases.length; i += batchSize) {
    const batch = cases.slice(i, i + batchSize);

    const { error } = await supabase
      .from(TABLE)
      .upsert(batch, { onConflict: "expediente_id" });

    if (error) {
      throw new Error(
        `[jurisprudencia-io] upsertCasesToDB batch ${Math.floor(i / batchSize) + 1} failed: ${error.message}`
      );
    }

    processed += batch.length;
  }

  return processed;
}

// ── Pure utility ──────────────────────────────────────────────────────────────

/**
 * Deduplicates incoming cases against an existing set.
 * Returns only truly new cases and the merged array.
 */
export function mergeNewCases(
  existing: JurisprudenciaCaseExtended[],
  incoming: JurisprudenciaCaseExtended[]
): { merged: JurisprudenciaCaseExtended[]; newCount: number } {
  const existingIds = new Set(existing.map((c) => c.expediente_id));
  const trulyNew = incoming.filter((c) => !existingIds.has(c.expediente_id));
  return {
    merged: [...existing, ...trulyNew],
    newCount: trulyNew.length,
  };
}

// ── Legacy JSON helpers (used only by migrate-json-to-supabase.ts) ────────────

/** @deprecated Use readJurisprudenciaDB() for all new code. */
export function readJurisprudenciaJSON(
  filePath: string = DEFAULT_DATA_FILE
): JurisprudenciaCaseExtended[] {
  if (!existsSync(filePath)) return [];
  try {
    const raw = readFileSync(filePath, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    const validated = casesArraySchema.parse(parsed);
    return validated as unknown as JurisprudenciaCaseExtended[];
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[jurisprudencia-io] Could not read ${filePath}: ${message}`);
    return [];
  }
}

/** @deprecated Use upsertCasesToDB() for all new code. */
export function writeJurisprudenciaJSON(
  cases: JurisprudenciaCaseExtended[],
  filePath: string = DEFAULT_DATA_FILE
): void {
  try {
    writeFileSync(filePath, JSON.stringify(cases, null, 2) + "\n", "utf-8");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `[jurisprudencia-io] Failed to write ${filePath}: ${message}`
    );
  }
}
