import { z } from "zod";
import { supabase } from "@/lib/supabase";

export const updateSchema = z.object({
  status: z.enum([
    "consulta_recibida",
    "reclamo_generado",
    "enviado_empresa",
    "en_mediacion",
    "escalado",
    "resuelto",
  ]).optional(),
  complaint_generated: z.boolean().optional(),
  arbitration_completed: z.boolean().optional(),
  escalation_channel: z.string().optional(),
  escalation_date: z.string().optional(),
}).strict();

export async function updateCaseById(
  caseId: string,
  userId: string,
  fields: z.infer<typeof updateSchema>
) {
  // Verify ownership
  const { data: existing } = await supabase
    .from("cases")
    .select("user_id")
    .eq("id", caseId)
    .single();

  if (!existing || existing.user_id !== userId) {
    return { data: null, error: "forbidden" as const };
  }

  const { data, error } = await supabase
    .from("cases")
    .update({
      ...fields,
      updated_at: new Date().toISOString(),
    })
    .eq("id", caseId)
    .select()
    .single();

  if (error) {
    return { data: null, error: "db_error" as const };
  }

  return { data, error: null };
}
