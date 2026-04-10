import { describe, it, expect } from "vitest";
import {
  getNewCasesForPinecone,
  buildVectorId,
} from "../../../scripts/lib/pinecone-helpers";
import type { JurisprudenciaCaseExtended } from "@/lib/types";

const makeCase = (id: string): JurisprudenciaCaseExtended => ({
  expediente_id: id,
  hechos: `Hechos ${id}`,
  ratio_decidendi: `Ratio ${id}`,
  probabilidad_exito: 0.8,
  duracion_dias: 90,
  pais: "AR",
  categoria: "banca",
  tribunal: "CNACom",
  fecha_resolucion: "2024-01-01",
  url_fuente: "https://example.com",
  texto_crudo: `texto ${id}`,
  normalizado_por_ia: true,
});

describe("buildVectorId", () => {
  it("converts expediente_id to safe vector ID", () => {
    const id = buildVectorId("CNACom Sala A - 2023/04521");
    expect(id).toMatch(/^[a-zA-Z0-9_-]+$/);
    expect(id).not.toContain(" ");
    expect(id).not.toContain("/");
  });

  it("produces consistent output", () => {
    expect(buildVectorId("test/id-1")).toBe(buildVectorId("test/id-1"));
  });
});

describe("getNewCasesForPinecone", () => {
  it("returns cases not already in Pinecone", () => {
    const allCases = [makeCase("case-1"), makeCase("case-2"), makeCase("case-3")];
    const existingIds = new Set(["case-1"]);
    const result = getNewCasesForPinecone(allCases, existingIds);
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.expediente_id)).toEqual(["case-2", "case-3"]);
  });

  it("skips cases with probabilidad_exito === 0 (not normalized)", () => {
    const allCases = [
      makeCase("case-1"),
      { ...makeCase("case-2"), probabilidad_exito: 0, normalizado_por_ia: false },
    ];
    const result = getNewCasesForPinecone(allCases, new Set());
    expect(result).toHaveLength(1);
    expect(result[0].expediente_id).toBe("case-1");
  });

  it("skips cases already in Pinecone AND with prob 0", () => {
    const allCases = [
      makeCase("already"),
      { ...makeCase("unnormalized"), probabilidad_exito: 0, normalizado_por_ia: false },
    ];
    const result = getNewCasesForPinecone(allCases, new Set(["already"]));
    expect(result).toHaveLength(0);
  });

  it("returns empty array when all cases already indexed", () => {
    const allCases = [makeCase("case-1"), makeCase("case-2")];
    const existingIds = new Set(["case-1", "case-2"]);
    expect(getNewCasesForPinecone(allCases, existingIds)).toHaveLength(0);
  });
});
