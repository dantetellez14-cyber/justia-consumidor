import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

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

/** Consumer reply to a company response. */
export interface ConsumerResponseView {
  readonly id: string;
  readonly tipo_respuesta: "aceptar" | "rechazar" | "contraofertar" | "mensaje";
  readonly mensaje: string;
  readonly monto_contraoferta: number | null;
  readonly created_at: string;
}

/** Unified message in the thread (either side). */
export type ThreadMessage =
  | (CompanyResponseView & { readonly sender: "empresa" })
  | (ConsumerResponseView & { readonly sender: "consumidor" });

/** CaseRecord extended with all messages for consumer views. */
export interface CaseWithResponses extends CaseRecord {
  readonly company_responses: ReadonlyArray<CompanyResponseView>;
  readonly consumer_responses: ReadonlyArray<ConsumerResponseView>;
}

export interface FeedbackRecord {
  id: string;
  user_id: string | null;
  case_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}
