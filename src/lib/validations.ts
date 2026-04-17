import { z } from "zod";

// ── /api/analyze ──
export const analyzeSchema = z.object({
  relato: z
    .string()
    .min(10, "El relato debe tener al menos 10 caracteres.")
    .max(5000, "El relato no puede superar los 5000 caracteres."),
});

export type AnalyzeInput = z.infer<typeof analyzeSchema>;

// ── /api/cases POST ──
export const createCaseSchema = z.object({
  relato: z.string().min(1),
  empresa: z.string().min(1),
  producto_servicio: z.string().min(1),
  monto_reclamo: z.number().positive(),
  fecha_incidente: z.string().min(1),
  core_grievance: z.string().min(1),
  probabilidad_exito: z.number().min(0).max(1),
  analisis_legal: z.string().min(1),
  pais_detectado: z.enum(["AR", "MX"]),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;

// ── /api/cases GET ──
export const getCaseQuerySchema = z.object({
  id: z.string().uuid().optional(),
});

// ── /api/feedback POST ──
export const feedbackSchema = z.object({
  case_id: z.string().uuid().nullable().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).nullable().optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

// ── /api/send-complaint POST ──
export const sendComplaintSchema = z.object({
  analysis: z.object({
    empresa: z.string().min(1),
    producto_servicio: z.string().min(1),
    monto_reclamo: z.number(),
    fecha_incidente: z.string(),
    core_grievance: z.string(),
    probabilidad_exito: z.number(),
    analisis_legal: z.string(),
    pais_detectado: z.enum(["AR", "MX"]),
  }),
  nombre: z.string().min(1, "Nombre es requerido."),
  email: z.string().email("Email inválido."),
  empresaEmail: z.string().email("Email de empresa inválido."),
  complaintText: z.string().min(10, "El texto del reclamo es muy corto."),
  caseId: z.string().uuid().nullable(),
  /** When true, send the complaint to the consumer's own email (skips domain check). */
  sendCopyToConsumer: z.boolean().optional(),
});

export type SendComplaintInput = z.infer<typeof sendComplaintSchema>;

// ── /api/search-jurisprudencia POST ──
export const searchJurisprudenciaSchema = z.object({
  query: z.string().min(1, "Query es requerido.").max(2000),
  pais: z.enum(["AR", "MX"]).optional(),
});

export type SearchJurisprudenciaInput = z.infer<typeof searchJurisprudenciaSchema>;

// ── Helper: format Zod errors into user-friendly message ──
export function formatZodError(error: z.ZodError<unknown>): string {
  return error.issues.map((issue) => issue.message).join(", ");
}
