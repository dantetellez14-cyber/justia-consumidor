import { describe, it, expect } from "vitest";
import { calculateFinancialMetrics } from "@/lib/scoring";
import type { CaseAnalysis } from "@/lib/types";

function makeAnalysis(overrides: Partial<CaseAnalysis> = {}): CaseAnalysis {
  return {
    empresa: "Test SA",
    producto_servicio: "Test",
    monto_reclamo: 100000,
    fecha_incidente: "2024-01-01",
    core_grievance: "Test",
    probabilidad_exito: 0.75,
    analisis_legal: "Art. 17 Ley 24.240",
    pais_detectado: "AR",
    ...overrides,
  };
}

describe("calculateFinancialMetrics", () => {
  it("returns correct structure", () => {
    const result = calculateFinancialMetrics(makeAnalysis());
    expect(result).toHaveProperty("valorReclamado");
    expect(result).toHaveProperty("valorEsperado");
    expect(result).toHaveProperty("costoAcuerdo");
    expect(result).toHaveProperty("costoLegal");
    expect(result).toHaveProperty("recomendacion");
  });

  it("valorReclamado equals monto_reclamo", () => {
    const result = calculateFinancialMetrics(
      makeAnalysis({ monto_reclamo: 200000 })
    );
    expect(result.valorReclamado).toBe(200000);
  });

  it("costoLegal is 25% of monto_reclamo", () => {
    const result = calculateFinancialMetrics(
      makeAnalysis({ monto_reclamo: 100000 })
    );
    expect(result.costoLegal).toBe(25000);
  });

  it("costoAcuerdo is 40% of monto_reclamo", () => {
    const result = calculateFinancialMetrics(
      makeAnalysis({ monto_reclamo: 100000 })
    );
    expect(result.costoAcuerdo).toBe(40000);
  });

  it("calculates E = P * V - (1 - P) * C correctly", () => {
    // P=0.75, V=100000, C=25000
    // E = 0.75 * 100000 - 0.25 * 25000 = 75000 - 6250 = 68750
    const result = calculateFinancialMetrics(
      makeAnalysis({ monto_reclamo: 100000, probabilidad_exito: 0.75 })
    );
    expect(result.valorEsperado).toBe(68750);
  });

  it("recommends SETTLE_NOW when E > settlement cost", () => {
    // P=0.9, V=100000 → E = 90000 - 2500 = 87500 > 40000
    const result = calculateFinancialMetrics(
      makeAnalysis({ probabilidad_exito: 0.9 })
    );
    expect(result.recomendacion).toBe("SETTLE_NOW");
  });

  it("recommends DEFEND_SELECTIVELY when E <= settlement cost", () => {
    // P=0.2, V=100000 → E = 20000 - 20000 = 0 < 40000
    const result = calculateFinancialMetrics(
      makeAnalysis({ probabilidad_exito: 0.2 })
    );
    expect(result.recomendacion).toBe("DEFEND_SELECTIVELY");
  });

  it("handles edge case: probabilidad_exito = 0", () => {
    // P=0, V=100000 → E = 0 - 25000 = -25000
    const result = calculateFinancialMetrics(
      makeAnalysis({ probabilidad_exito: 0 })
    );
    expect(result.valorEsperado).toBe(-25000);
    expect(result.recomendacion).toBe("DEFEND_SELECTIVELY");
  });

  it("handles edge case: probabilidad_exito = 1", () => {
    // P=1, V=100000 → E = 100000 - 0 = 100000 > 40000
    const result = calculateFinancialMetrics(
      makeAnalysis({ probabilidad_exito: 1 })
    );
    expect(result.valorEsperado).toBe(100000);
    expect(result.recomendacion).toBe("SETTLE_NOW");
  });

  it("returns rounded values", () => {
    // P=0.33, V=77777 → E = 25666.41 - 13055.73 = 12610.68 → 12611
    const result = calculateFinancialMetrics(
      makeAnalysis({ monto_reclamo: 77777, probabilidad_exito: 0.33 })
    );
    expect(Number.isInteger(result.valorEsperado)).toBe(true);
    expect(Number.isInteger(result.costoAcuerdo)).toBe(true);
    expect(Number.isInteger(result.costoLegal)).toBe(true);
  });

  it("handles small amounts", () => {
    const result = calculateFinancialMetrics(
      makeAnalysis({ monto_reclamo: 100, probabilidad_exito: 0.5 })
    );
    expect(result.valorReclamado).toBe(100);
    expect(result.costoLegal).toBe(25);
    expect(result.costoAcuerdo).toBe(40);
  });
});
