import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  readJurisprudenciaJSON,
  writeJurisprudenciaJSON,
  mergeNewCases,
} from "../../../scripts/lib/jurisprudencia-io";
import type { JurisprudenciaCaseExtended } from "@/lib/types";

const makeCase = (id: string, pais: "AR" | "MX" = "AR"): JurisprudenciaCaseExtended => ({
  expediente_id: id,
  hechos: `Hechos del caso ${id}`,
  ratio_decidendi: `Ratio del caso ${id}`,
  probabilidad_exito: 0.75,
  duracion_dias: 90,
  pais,
  categoria: "ecommerce",
  tribunal: "CNACom Sala A",
  fecha_resolucion: "2024-01-15",
  url_fuente: `https://example.com/${id}`,
  texto_crudo: `Texto crudo ${id}`,
  normalizado_por_ia: false,
});

describe("readJurisprudenciaJSON", () => {
  let tmpFile: string;

  beforeEach(() => {
    tmpFile = join(tmpdir(), `juris-test-${Date.now()}.json`);
  });

  afterEach(() => {
    if (existsSync(tmpFile)) unlinkSync(tmpFile);
  });

  it("returns empty array when file does not exist", () => {
    const result = readJurisprudenciaJSON("/non/existent/path.json");
    expect(result).toEqual([]);
  });

  it("reads and parses existing JSON file", () => {
    const cases = [makeCase("case-1"), makeCase("case-2", "MX")];
    writeFileSync(tmpFile, JSON.stringify(cases, null, 2));
    const result = readJurisprudenciaJSON(tmpFile);
    expect(result).toHaveLength(2);
    expect(result[0].expediente_id).toBe("case-1");
    expect(result[1].pais).toBe("MX");
  });

  it("returns empty array on malformed JSON", () => {
    writeFileSync(tmpFile, "{ invalid json }");
    const result = readJurisprudenciaJSON(tmpFile);
    expect(result).toEqual([]);
  });
});

describe("writeJurisprudenciaJSON", () => {
  let tmpFile: string;

  beforeEach(() => {
    tmpFile = join(tmpdir(), `juris-write-${Date.now()}.json`);
  });

  afterEach(() => {
    if (existsSync(tmpFile)) unlinkSync(tmpFile);
  });

  it("writes cases as pretty-printed JSON", () => {
    const cases = [makeCase("case-1")];
    writeJurisprudenciaJSON(cases, tmpFile);
    const raw = readFileSync(tmpFile, "utf-8");
    const parsed = JSON.parse(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].expediente_id).toBe("case-1");
    // file should end with a newline for POSIX compliance
    expect(raw.endsWith("\n")).toBe(true);
  });
});

describe("mergeNewCases", () => {
  it("adds new cases to existing array", () => {
    const existing = [makeCase("old-1"), makeCase("old-2")];
    const incoming = [makeCase("new-1"), makeCase("new-2")];
    const { merged, newCount } = mergeNewCases(existing, incoming);
    expect(merged).toHaveLength(4);
    expect(newCount).toBe(2);
  });

  it("deduplicates by expediente_id — skips existing", () => {
    const existing = [makeCase("case-1"), makeCase("case-2")];
    const incoming = [makeCase("case-2"), makeCase("case-3")];
    const { merged, newCount } = mergeNewCases(existing, incoming);
    expect(merged).toHaveLength(3);
    expect(newCount).toBe(1);
  });

  it("returns original array unchanged when all incoming are duplicates", () => {
    const existing = [makeCase("case-1")];
    const incoming = [makeCase("case-1")];
    const { merged, newCount } = mergeNewCases(existing, incoming);
    expect(merged).toHaveLength(1);
    expect(newCount).toBe(0);
  });

  it("handles empty existing array", () => {
    const incoming = [makeCase("new-1")];
    const { merged, newCount } = mergeNewCases([], incoming);
    expect(merged).toHaveLength(1);
    expect(newCount).toBe(1);
  });

  it("handles empty incoming array", () => {
    const existing = [makeCase("case-1")];
    const { merged, newCount } = mergeNewCases(existing, []);
    expect(merged).toHaveLength(1);
    expect(newCount).toBe(0);
  });
});
