import { NextRequest, NextResponse } from "next/server";
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

  const { data, error } = await supabase
    .from("cases")
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
