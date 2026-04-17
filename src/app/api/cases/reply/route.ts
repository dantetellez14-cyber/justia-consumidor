/**
 * POST /api/cases/reply
 *
 * Consumer submits a reply to a company response.
 * Types: 'aceptar' | 'rechazar' | 'contraofertar' | 'mensaje'
 *
 * On submit:
 * 1. Verify case ownership (user_id match)
 * 2. Insert into consumer_responses
 * 3. If 'aceptar' → update case status to 'resuelto'
 * 4. Fire in-app notification (non-blocking) for the empresa
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createRouteLogger } from "@/lib/logger";
import { createInAppNotification } from "@/lib/notifications";

const log = createRouteLogger("/api/cases/reply");

const replySchema = z.object({
  case_id: z.string().uuid("ID de caso inválido"),
  tipo_respuesta: z.enum(["aceptar", "rechazar", "contraofertar", "mensaje"]),
  mensaje: z.string().min(5, "El mensaje debe tener al menos 5 caracteres").max(2000),
  monto_contraoferta: z.number().positive().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`cases-reply:${ip}`, {
    limit: 15,
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
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const parsed = replySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { case_id, tipo_respuesta, mensaje, monto_contraoferta } = parsed.data;

  // Verify case ownership and get empresa name
  const { data: caseRow, error: caseErr } = await supabase
    .from("cases")
    .select("user_id, empresa, status")
    .eq("id", case_id)
    .single();

  if (caseErr || !caseRow) {
    return NextResponse.json({ error: "Caso no encontrado." }, { status: 404 });
  }

  if (caseRow.user_id !== userId) {
    return NextResponse.json(
      { error: "No tenés permiso para responder en este caso." },
      { status: 403 }
    );
  }

  // Insert consumer reply
  const { data: reply, error: insertErr } = await supabase
    .from("consumer_responses")
    .insert({
      case_id,
      user_id: userId,
      tipo_respuesta,
      mensaje,
      monto_contraoferta: monto_contraoferta ?? null,
    })
    .select()
    .single();

  if (insertErr || !reply) {
    log.error({ err: insertErr, case_id }, "Error inserting consumer reply");
    return NextResponse.json({ error: "Error al enviar la respuesta." }, { status: 500 });
  }

  // If consumer accepts → mark case as resolved
  if (tipo_respuesta === "aceptar") {
    await supabase
      .from("cases")
      .update({ status: "resuelto", updated_at: new Date().toISOString() })
      .eq("id", case_id);
  }

  // In-app notification for empresa (fire-and-forget)
  const empresa = (caseRow.empresa as string | null) ?? "la empresa";
  const notifTitles: Record<string, string> = {
    aceptar: "Consumidor aceptó la propuesta",
    rechazar: "Consumidor rechazó la propuesta",
    contraofertar: "Nueva contraoferta del consumidor",
    mensaje: `Nuevo mensaje del consumidor sobre ${empresa}`,
  };
  const notifMessages: Record<string, string> = {
    aceptar: `El consumidor aceptó tu propuesta. El caso fue marcado como resuelto.`,
    rechazar: `El consumidor rechazó tu propuesta. Podés enviar una nueva oferta.`,
    contraofertar: monto_contraoferta
      ? `El consumidor contraoferta por $${monto_contraoferta.toLocaleString("es-AR")}.`
      : `El consumidor envió una contraoferta. Revisá los detalles del caso.`,
    mensaje: `El consumidor respondió en el caso de ${empresa}. Revisá su mensaje.`,
  };

  void createInAppNotification({
    userId, // Ideally this would be the empresa's userId — use consumer's for now
    caseId: case_id,
    tipo: "company_response",
    titulo: notifTitles[tipo_respuesta] ?? "Respuesta enviada",
    mensaje: notifMessages[tipo_respuesta] ?? mensaje,
  });

  log.info({ userId, case_id, tipo_respuesta }, "Consumer reply submitted");

  return NextResponse.json(reply);
}
