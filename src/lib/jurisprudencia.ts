import { z } from "zod";
import casesData from "../../data/jurisprudencia.json";
import type { JurisprudenciaCase, JurisprudenciaCaseExtended } from "./types";

// Runtime validation schema: ensures all required fields are present.
// Includes base case fields plus extended fields that should be in the JSON.
const caseSchema = z.object({
  // Base case fields
  expediente_id: z.string(),
  hechos: z.string(),
  ratio_decidendi: z.string(),
  probabilidad_exito: z.number(),
  duracion_dias: z.number(),
  pais: z.enum(["AR", "MX"]),
  // Extended case fields
  categoria: z.string(),
  tribunal: z.string(),
  fecha_resolucion: z.string(),
  url_fuente: z.string(),
  texto_crudo: z.string(),
  normalizado_por_ia: z.boolean(),
}).passthrough();

const casesArraySchema = z.array(caseSchema);

function loadAndValidateCases(): ReadonlyArray<JurisprudenciaCaseExtended> {
  const result = casesArraySchema.safeParse(casesData as unknown);
  if (!result.success) {
    throw new Error(
      `[jurisprudencia] data/jurisprudencia.json failed validation: ${result.error.message}`
    );
  }
  return result.data as JurisprudenciaCaseExtended[];
}

export const jurisprudencia: ReadonlyArray<JurisprudenciaCaseExtended> =
  loadAndValidateCases();

export function filterByCountry(
  pais: "AR" | "MX"
): ReadonlyArray<JurisprudenciaCase> {
  return jurisprudencia.filter((c) => c.pais === pais);
}
