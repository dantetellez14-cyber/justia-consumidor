import { describe, it, expect } from "vitest";
import {
  calculateReputationScore,
  getScoreBgColor,
  getScoreRingColor,
  getLevelLabel,
} from "@/lib/reputation-score";
import type { CompanyStats, SectorStats } from "@/lib/complaint-stats";

function makeCompany(overrides: Partial<CompanyStats> = {}): CompanyStats {
  return {
    empresa: "Test Company",
    sector: "Telecomunicaciones",
    pais: "MX",
    total_quejas: 500,
    quejas_conciliadas: 350,
    quejas_no_conciliadas: 150,
    monto_promedio_reclamado: 5000,
    monto_promedio_recuperado: 3500,
    tasa_resolucion: 0.7,
    periodo: "2023-2024",
    fuente: "PROFECO",
    ...overrides,
  };
}

function makeSector(overrides: Partial<SectorStats> = {}): SectorStats {
  return {
    sector: "Telecomunicaciones",
    pais: "MX",
    total_quejas: 50000,
    tasa_resolucion_promedio: 0.55,
    duracion_promedio_dias: 30,
    empresa_mas_reclamada: "Telmex",
    periodo: "2023-2024",
    ...overrides,
  };
}

describe("calculateReputationScore", () => {
  it("returns a score between 0 and 10", () => {
    const result = calculateReputationScore(makeCompany(), makeSector());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(10);
  });

  it("returns excelente for a high-performing company", () => {
    const company = makeCompany({
      tasa_resolucion: 0.95,
      monto_promedio_reclamado: 1000,
      monto_promedio_recuperado: 950,
      total_quejas: 100,
    });
    const sector = makeSector({ total_quejas: 50000 });
    const result = calculateReputationScore(company, sector);
    expect(result.level).toBe("excelente");
    expect(result.score).toBeGreaterThanOrEqual(8);
  });

  it("returns no_recomendado for a poorly performing company", () => {
    const company = makeCompany({
      tasa_resolucion: 0.05,
      monto_promedio_reclamado: 10000,
      monto_promedio_recuperado: 100,
      total_quejas: 25000,
    });
    const sector = makeSector({ total_quejas: 50000 });
    const result = calculateReputationScore(company, sector);
    expect(result.level).toBe("no_recomendado");
    expect(result.score).toBeLessThan(2);
  });

  it("handles null sector stats gracefully", () => {
    const result = calculateReputationScore(makeCompany(), null);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(10);
    expect(result.dimensions.volumen).toBe(5); // neutral when no sector data
  });

  it("handles null resolution rate with neutral score", () => {
    const company = makeCompany({ tasa_resolucion: null });
    const result = calculateReputationScore(company, makeSector());
    expect(result.dimensions.resolucion).toBe(5);
  });

  it("handles null monetary amounts gracefully", () => {
    const company = makeCompany({
      monto_promedio_reclamado: null,
      monto_promedio_recuperado: null,
    });
    const result = calculateReputationScore(company, makeSector());
    expect(result.dimensions.recuperacion).toBe(5);
  });

  it("includes all four dimension scores", () => {
    const result = calculateReputationScore(makeCompany(), makeSector());
    expect(result.dimensions).toHaveProperty("resolucion");
    expect(result.dimensions).toHaveProperty("recuperacion");
    expect(result.dimensions).toHaveProperty("volumen");
    expect(result.dimensions).toHaveProperty("resultado");
  });

  it("generates a veredicto string containing the company name", () => {
    const company = makeCompany({ empresa: "MercadoLibre" });
    const result = calculateReputationScore(company, makeSector());
    expect(result.veredicto).toContain("MercadoLibre");
  });

  it("returns a CSS color class", () => {
    const result = calculateReputationScore(makeCompany(), makeSector());
    expect(result.color).toMatch(/^text-/);
  });
});

describe("helper functions", () => {
  it("getScoreBgColor returns bg- class", () => {
    expect(getScoreBgColor("excelente")).toBe("bg-emerald-500");
    expect(getScoreBgColor("no_recomendado")).toBe("bg-red-500");
  });

  it("getScoreRingColor returns ring- class", () => {
    expect(getScoreRingColor("bueno")).toBe("ring-blue-200");
  });

  it("getLevelLabel returns Spanish labels", () => {
    expect(getLevelLabel("excelente")).toBe("Excelente");
    expect(getLevelLabel("malo")).toBe("Malo");
    expect(getLevelLabel("no_recomendado")).toBe("No recomendado");
  });
});
