import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const updateSchema = z.object({
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

/**
 * Internal helper: update a case by id with ownership check.
 * Used by PATCH handler and by other server-side routes (e.g., send-complaint).
 */
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

// PATCH: Update case status or fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`cases-patch:${ip}`, {
    limit: 20,
    windowSeconds: 60,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta en ${resetIn}s.` },
      { status: 429 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Debes iniciar sesion." },
      { status: 401 }
    );
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud invalido." },
      { status: 400 }
    );
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const result = await updateCaseById(id, userId, parsed.data);

  if (result.error === "forbidden") {
    return NextResponse.json(
      { error: "No tienes permiso para modificar este caso." },
      { status: 403 }
    );
  }

  if (result.error === "db_error") {
    return NextResponse.json(
      { error: "Error al actualizar el caso." },
      { status: 500 }
    );
  }

  return NextResponse.json(result.data);
}
