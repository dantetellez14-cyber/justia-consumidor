import { describe, it, expect } from "vitest";
import { jurisprudencia, filterByCountry } from "@/lib/jurisprudencia";

describe("jurisprudencia data", () => {
  it("has 10 cases total", () => {
    expect(jurisprudencia).toHaveLength(10);
  });

  it("has 5 Argentine cases", () => {
    const ar = jurisprudencia.filter((c) => c.pais === "AR");
    expect(ar).toHaveLength(5);
  });

  it("has 5 Mexican cases", () => {
    const mx = jurisprudencia.filter((c) => c.pais === "MX");
    expect(mx).toHaveLength(5);
  });

  it("all cases have required fields", () => {
    for (const c of jurisprudencia) {
      expect(c.expediente_id).toBeTruthy();
      expect(c.hechos).toBeTruthy();
      expect(c.ratio_decidendi).toBeTruthy();
      expect(c.probabilidad_exito).toBeGreaterThan(0);
      expect(c.probabilidad_exito).toBeLessThanOrEqual(1);
      expect(c.duracion_dias).toBeGreaterThan(0);
      expect(["AR", "MX"]).toContain(c.pais);
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
    expect(result.length).toBe(5);
    expect(result.every((c) => c.pais === "AR")).toBe(true);
  });

  it("returns only Mexican cases for MX", () => {
    const result = filterByCountry("MX");
    expect(result.length).toBe(5);
    expect(result.every((c) => c.pais === "MX")).toBe(true);
  });

  it("does not mutate the original array", () => {
    const before = jurisprudencia.length;
    filterByCountry("AR");
    expect(jurisprudencia.length).toBe(before);
  });
});
