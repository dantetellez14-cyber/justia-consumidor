import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import type { JurisprudenciaCaseExtended } from "../../src/lib/types";

const DEFAULT_DATA_FILE = resolve(process.cwd(), "data/jurisprudencia.json");

// Minimal runtime guard: verify it's an array of objects with expediente_id.
// Full field validation happens in the normalize step.
const casesArraySchema = z.array(
  z.object({ expediente_id: z.string() }).passthrough()
);

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

export function writeJurisprudenciaJSON(
  cases: JurisprudenciaCaseExtended[],
  filePath: string = DEFAULT_DATA_FILE
): void {
  try {
    writeFileSync(filePath, JSON.stringify(cases, null, 2) + "\n", "utf-8");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`[jurisprudencia-io] Failed to write ${filePath}: ${message}`);
  }
}

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
