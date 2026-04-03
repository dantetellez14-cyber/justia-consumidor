import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type CaseStatus =
  | "consulta_recibida"
  | "reclamo_generado"
  | "enviado_empresa"
  | "en_mediacion"
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

export interface FeedbackRecord {
  id: string;
  user_id: string | null;
  case_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}
