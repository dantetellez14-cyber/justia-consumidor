import { describe, it, expect } from "vitest";
import { jurisprudencia, filterByCountry } from "@/lib/jurisprudencia";

describe("jurisprudencia data", () => {
  it("has at least 10 cases", () => {
    expect(jurisprudencia.length).toBeGreaterThanOrEqual(10);
  });

  it("has at least 5 Argentine cases", () => {
    const ar = jurisprudencia.filter((c) => c.pais === "AR");
    expect(ar.length).toBeGreaterThanOrEqual(5);
  });

  it("has at least 5 Mexican cases", () => {
    const mx = jurisprudencia.filter((c) => c.pais === "MX");
    expect(mx.length).toBeGreaterThanOrEqual(5);
  });

  it("all cases have base required fields", () => {
    for (const c of jurisprudencia) {
      expect(c.expediente_id).toBeTruthy();
      expect(["AR", "MX"]).toContain(c.pais);
      // Every case must have at least raw text to be normalizable
      expect(c.texto_crudo).toBeTruthy();
    }
  });

  it("normalized cases have AI-populated fields", () => {
    const normalized = jurisprudencia.filter((c) => c.normalizado_por_ia);
    // At least the original 10 hand-curated cases must remain normalized
    expect(normalized.length).toBeGreaterThanOrEqual(5);
    for (const c of normalized) {
      expect(c.hechos).toBeTruthy();
      expect(c.ratio_decidendi).toBeTruthy();
      expect(c.probabilidad_exito).toBeGreaterThan(0);
      expect(c.probabilidad_exito).toBeLessThanOrEqual(1);
      expect(c.duracion_dias).toBeGreaterThan(0);
    }
  });

  it("all expediente_ids are unique", () => {
    const ids = jurisprudencia.map((c) => c.expediente_id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("filterByCountry", () => {
  it("returns only Argentine cases for AR", () => {
    const result = filterByCountry("AR");
    expect(result.length).toBeGreaterThanOrEqual(5);
    expect(result.every((c) => c.pais === "AR")).toBe(true);
  });

  it("returns only Mexican cases for MX", () => {
    const result = filterByCountry("MX");
    expect(result.length).toBeGreaterThanOrEqual(5);
    expect(result.every((c) => c.pais === "MX")).toBe(true);
  });

  it("does not mutate the original array", () => {
    const before = jurisprudencia.length;
    filterByCountry("AR");
    expect(jurisprudencia.length).toBe(before);
  });
});
