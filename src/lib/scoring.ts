import { CaseAnalysis, FinancialMetrics } from "./types";

/**
 * Calculates Expected Value and recommendation.
 *
 * E = P * V - (1 - P) * C
 * where P = probabilidad_exito, V = monto_reclamo, C = costo_defensa (25% of V)
 *
 * If E > settlement cost (40% of V), recommend SETTLE NOW.
 * Otherwise, DEFEND SELECTIVELY.
 */
export function calculateFinancialMetrics(
  analysis: CaseAnalysis
): FinancialMetrics {
  const P = analysis.probabilidad_exito;
  const V = analysis.monto_reclamo;
  const C = V * 0.25; // Defense cost = 25% of claim value

  const valorEsperado = P * V - (1 - P) * C;
  const costoAcuerdo = V * 0.4; // Settlement cost = 40% of claim value

  const recomendacion: "SETTLE_NOW" | "DEFEND_SELECTIVELY" =
    valorEsperado > costoAcuerdo ? "SETTLE_NOW" : "DEFEND_SELECTIVELY";

  return {
    valorReclamado: V,
    valorEsperado: Math.round(valorEsperado),
    costoAcuerdo: Math.round(costoAcuerdo),
    costoLegal: Math.round(C),
    recomendacion,
  };
}
