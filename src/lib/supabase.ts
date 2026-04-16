import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Public client (anon key) — used only on the client-side.
 * Subject to RLS policies. With strict policies, this client
 * cannot read/write data directly.
 */
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Admin client (secret key) — used only on the server-side (API routes).
 * Bypasses RLS, so access control is handled by Clerk auth in each route.
 *
 * NEVER expose this client or SUPABASE_SECRET_KEY to the browser.
 */
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
if (!supabaseSecretKey && typeof window === "undefined") {
  throw new Error("SUPABASE_SECRET_KEY is required on the server");
}
export const supabase = createClient(
  supabaseUrl,
  supabaseSecretKey || supabaseAnonKey
);

export type CaseStatus =
  | "consulta_recibida"
  | "reclamo_generado"
  | "enviado_empresa"
  | "en_mediacion"
  | "escalado"
  | "resuelto";

export interface CaseRecord {
  id: string;
  user_id: string | null;
  relato: string;
  empresa: string | null;
  producto_servicio: string | null;
  monto_reclamo: number | null;
  fecha_incidente: string | null;
  core_grievance: string | null;
  probabilidad_exito: number | null;
  analisis_legal: string | null;
  pais_detectado: "AR" | "MX" | null;
  status: CaseStatus;
  complaint_generated: boolean;
  arbitration_completed: boolean;
  created_at: string;
  updated_at: string;
}

/** Consumer-facing view of a company response (omits internal IDs). */
export interface CompanyResponseView {
  readonly id: string;
  readonly tipo_respuesta: "aceptar" | "rechazar" | "propuesta" | "solicitar_info";
  readonly mensaje: string;
  readonly propuesta_monto: number | null;
  readonly created_at: string;
}

/** CaseRecord extended with company responses for consumer views. */
export interface CaseWithResponses extends CaseRecord {
  readonly company_responses: ReadonlyArray<CompanyResponseView>;
}

export interface FeedbackRecord {
  id: string;
  user_id: string | null;
  case_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}
