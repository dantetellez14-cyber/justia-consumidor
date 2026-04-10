import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { JurisprudenciaCaseExtended } from "../../src/lib/types";

const DEFAULT_DATA_FILE = resolve(process.cwd(), "data/jurisprudencia.json");

export function readJurisprudenciaJSON(
  filePath: string = DEFAULT_DATA_FILE
): JurisprudenciaCaseExtended[] {
  if (!existsSync(filePath)) return [];
  try {
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as JurisprudenciaCaseExtended[];
  } catch {
    console.warn(`[jurisprudencia-io] Could not parse ${filePath}, returning []`);
    return [];
  }
}

export function writeJurisprudenciaJSON(
  cases: JurisprudenciaCaseExtended[],
  filePath: string = DEFAULT_DATA_FILE
): void {
  writeFileSync(filePath, JSON.stringify(cases, null, 2) + "\n", "utf-8");
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
