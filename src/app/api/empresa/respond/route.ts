import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getCompanyForUser, submitResponse } from "@/lib/empresa";
import { notifyConsumerResponse } from "@/lib/notifications";

const responseSchema = z.object({
  case_id: z.string().uuid("ID de caso invalido"),
  tipo_respuesta: z.enum(["aceptar", "rechazar", "propuesta", "solicitar_info"]),
  mensaje: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
  propuesta_monto: z.number().positive().optional(),
});

/**
 * POST /api/empresa/respond — Submit a response to a consumer complaint
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`empresa-respond:${ip}`, {
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

  const company = await getCompanyForUser(userId);
  if (!company) {
    return NextResponse.json(
      { error: "No tienes una empresa registrada." },
      { status: 403 }
    );
  }

  if (company.role === "lectura") {
    return NextResponse.json(
      { error: "No tienes permisos para responder reclamos." },
      { status: 403 }
    );
  }

  if (!company.account.verificada) {
    return NextResponse.json(
      {
        error:
          "Empresa pendiente de verificacion. Un empleado con email corporativo debe vincularse para habilitar respuestas.",
      },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud invalido." },
      { status: 400 }
    );
  }

  const parsed = responseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  try {
    const response = await submitResponse(
      parsed.data.case_id,
      company.account.id,
      userId,
      {
        tipo_respuesta: parsed.data.tipo_respuesta,
        mensaje: parsed.data.mensaje,
        propuesta_monto: parsed.data.propuesta_monto,
      }
    );

    // Fire-and-forget: notify the consumer by email
    notifyConsumerResponse({
      caseId: parsed.data.case_id,
      empresaNombre: company.account.nombre,
      tipoRespuesta: parsed.data.tipo_respuesta,
      mensaje: parsed.data.mensaje,
      propuestaMonto: parsed.data.propuesta_monto ?? null,
    }).catch(() => {}); // swallow — non-critical

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al responder.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
