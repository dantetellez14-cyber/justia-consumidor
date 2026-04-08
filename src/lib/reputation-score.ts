/**
 * Reputation scoring algorithm for companies.
 *
 * Inspired by Reclame AQUI (Brazil) — scores companies 0–10 based on
 * resolution rate, recovery rate, complaint volume relative to sector,
 * and overall consumer outcome quality.
 *
 * Data sources: PROFECO (MX), Defensa del Consumidor (AR).
 */

import type { CompanyStats, SectorStats } from "./complaint-stats";

// ── Score result ──

export type ScoreLevel =
  | "excelente"    // 8.0–10.0
  | "bueno"        // 6.0–7.9
  | "regular"      // 4.0–5.9
  | "malo"         // 2.0–3.9
  | "no_recomendado"; // 0.0–1.9

export interface ReputationScore {
  /** Overall score 0.0–10.0 */
  readonly score: number;
  /** Human-readable level */
  readonly level: ScoreLevel;
  /** Individual dimension scores (each 0–10) */
  readonly dimensions: {
    /** How often the company resolves complaints */
    readonly resolucion: number;
    /** How much money consumers recover vs what they claim */
    readonly recuperacion: number;
    /** Complaint volume relative to sector (lower = better) */
    readonly volumen: number;
    /** Overall consumer outcome quality */
    readonly resultado: number;
  };
  /** Short recommendation text */
  readonly veredicto: string;
  /** CSS color class for the score */
  readonly color: string;
}

// ── Scoring weights ──

const WEIGHTS = {
  resolucion: 0.40,   // Resolution rate is the most important signal
  recuperacion: 0.25, // How much money consumers actually get back
  volumen: 0.15,      // Complaint volume relative to sector peers
  resultado: 0.20,    // Combined outcome quality
} as const;

// ── Score computation ──

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Score the resolution rate dimension (0–10).
 *
 * Mapping:
 *   100% resolved → 10.0
 *   70%+ → 7.0–9.0 (good)
 *   50%  → 5.0 (average)
 *   30%  → 3.0 (poor)
 *   0%   → 0.0
 */
function scoreResolucion(tasaResolucion: number | null): number {
  if (tasaResolucion === null) return 5.0; // No data = neutral
  return clamp(tasaResolucion * 10, 0, 10);
}

/**
 * Score the recovery rate dimension (0–10).
 * What percentage of claimed money does the consumer actually recover?
 */
function scoreRecuperacion(
  montoReclamado: number | null,
  montoRecuperado: number | null
): number {
  if (!montoReclamado || !montoRecuperado || montoReclamado <= 0) return 5.0;
  const ratio = montoRecuperado / montoReclamado;
  // 100% recovery → 10, 75% → 8.5, 50% → 6, 25% → 3.5, 0% → 1
  return clamp(ratio * 10 + 0.5, 0, 10);
}

/**
 * Score the complaint volume dimension (0–10).
 * Companies with fewer complaints relative to their sector score higher.
 * This is INVERTED: more complaints = lower score.
 */
function scoreVolumen(
  companyComplaints: number,
  sectorTotal: number | null
): number {
  if (!sectorTotal || sectorTotal <= 0) return 5.0;

  // What percentage of all sector complaints belong to this company?
  const shareOfSector = companyComplaints / sectorTotal;

  // Ideal: < 5% of sector complaints → 10
  // Average: ~15% → 5
  // Bad: > 30% → 1
  if (shareOfSector <= 0.03) return 10;
  if (shareOfSector <= 0.05) return 9;
  if (shareOfSector <= 0.10) return 7;
  if (shareOfSector <= 0.15) return 5;
  if (shareOfSector <= 0.25) return 3;
  if (shareOfSector <= 0.40) return 1.5;
  return 0.5;
}

/**
 * Score the overall consumer outcome (0–10).
 * Combines resolution + recovery into a composite outcome metric.
 */
function scoreResultado(
  tasaResolucion: number | null,
  montoReclamado: number | null,
  montoRecuperado: number | null
): number {
  const resScore = scoreResolucion(tasaResolucion);
  const recScore = scoreRecuperacion(montoReclamado, montoRecuperado);
  // Weighted average: resolution matters slightly more
  return resScore * 0.6 + recScore * 0.4;
}

/**
 * Determine the level from a numeric score.
 */
function getLevel(score: number): ScoreLevel {
  if (score >= 8.0) return "excelente";
  if (score >= 6.0) return "bueno";
  if (score >= 4.0) return "regular";
  if (score >= 2.0) return "malo";
  return "no_recomendado";
}

/**
 * Get display color for the score level.
 */
function getColor(level: ScoreLevel): string {
  switch (level) {
    case "excelente": return "text-emerald-600";
    case "bueno": return "text-blue-600";
    case "regular": return "text-amber-600";
    case "malo": return "text-orange-600";
    case "no_recomendado": return "text-red-600";
  }
}

/**
 * Get the background color for the score badge.
 */
export function getScoreBgColor(level: ScoreLevel): string {
  switch (level) {
    case "excelente": return "bg-emerald-500";
    case "bueno": return "bg-blue-500";
    case "regular": return "bg-amber-500";
    case "malo": return "bg-orange-500";
    case "no_recomendado": return "bg-red-500";
  }
}

/**
 * Get a ring/border color for the score.
 */
export function getScoreRingColor(level: ScoreLevel): string {
  switch (level) {
    case "excelente": return "ring-emerald-200";
    case "bueno": return "ring-blue-200";
    case "regular": return "ring-amber-200";
    case "malo": return "ring-orange-200";
    case "no_recomendado": return "ring-red-200";
  }
}

/**
 * Get Spanish label for the level.
 */
export function getLevelLabel(level: ScoreLevel): string {
  switch (level) {
    case "excelente": return "Excelente";
    case "bueno": return "Bueno";
    case "regular": return "Regular";
    case "malo": return "Malo";
    case "no_recomendado": return "No recomendado";
  }
}

/**
 * Generate a short verdict text.
 */
function getVeredicto(
  level: ScoreLevel,
  empresa: string,
  tasaResolucion: number | null
): string {
  const pct = tasaResolucion !== null ? `${(tasaResolucion * 100).toFixed(0)}%` : "datos insuficientes";

  switch (level) {
    case "excelente":
      return `${empresa} tiene un historial excelente de resolución de reclamos (${pct}). La mayoría de los consumidores logran una solución favorable.`;
    case "bueno":
      return `${empresa} resuelve la mayoría de los reclamos satisfactoriamente (${pct}). Las probabilidades de una buena resolución son favorables.`;
    case "regular":
      return `${empresa} tiene un historial mixto (${pct} de resolución). Preparar documentación sólida mejora tus chances.`;
    case "malo":
      return `${empresa} tiene un historial desfavorable (${pct} de resolución). Recomendamos documentar todo y considerar escalar a PROFECO/COPREC.`;
    case "no_recomendado":
      return `${empresa} tiene un historial muy pobre de resolución (${pct}). Es altamente recomendable escalar formalmente y documentar todo el proceso.`;
  }
}

// ── Main scoring function ──

/**
 * Calculate the reputation score for a company.
 */
export function calculateReputationScore(
  company: CompanyStats,
  sectorStats: SectorStats | null
): ReputationScore {
  const dimResolucion = scoreResolucion(company.tasa_resolucion);
  const dimRecuperacion = scoreRecuperacion(
    company.monto_promedio_reclamado,
    company.monto_promedio_recuperado
  );
  const dimVolumen = scoreVolumen(
    company.total_quejas,
    sectorStats?.total_quejas ?? null
  );
  const dimResultado = scoreResultado(
    company.tasa_resolucion,
    company.monto_promedio_reclamado,
    company.monto_promedio_recuperado
  );

  const rawScore =
    dimResolucion * WEIGHTS.resolucion +
    dimRecuperacion * WEIGHTS.recuperacion +
    dimVolumen * WEIGHTS.volumen +
    dimResultado * WEIGHTS.resultado;

  const score = Math.round(clamp(rawScore, 0, 10) * 10) / 10;
  const level = getLevel(score);

  return {
    score,
    level,
    dimensions: {
      resolucion: Math.round(dimResolucion * 10) / 10,
      recuperacion: Math.round(dimRecuperacion * 10) / 10,
      volumen: Math.round(dimVolumen * 10) / 10,
      resultado: Math.round(dimResultado * 10) / 10,
    },
    veredicto: getVeredicto(level, company.empresa, company.tasa_resolucion),
    color: getColor(level),
  };
}
