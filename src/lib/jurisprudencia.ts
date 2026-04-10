import casesData from "../../data/jurisprudencia.json";
import type { JurisprudenciaCase, JurisprudenciaCaseExtended } from "./types";

// Load cases from data/jurisprudencia.json (source of truth).
// The JSON file contains the full JurisprudenciaCaseExtended objects.
export const jurisprudencia: ReadonlyArray<JurisprudenciaCase> =
  casesData as JurisprudenciaCaseExtended[];

export function filterByCountry(
  pais: "AR" | "MX"
): ReadonlyArray<JurisprudenciaCase> {
  return jurisprudencia.filter((c) => c.pais === pais);
}
