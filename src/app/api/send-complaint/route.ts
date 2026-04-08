import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";
import {
  buildComplaintEmailHtml,
  buildUserConfirmationHtml,
} from "@/lib/email/templates";
import { sendComplaintSchema, formatZodError } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logError, createRouteLogger } from "@/lib/logger";
import { notifyEmpresaNewComplaint } from "@/lib/notifications";

const log = createRouteLogger("/api/send-complaint");

function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "JustIA Consumidor <noreply@justia-consumidor.com>";

export async function POST(request: NextRequest) {
  // Rate limit: 5 emails per hour per IP
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`send-complaint:${ip}`, {
    limit: 5,
    windowSeconds: 3600,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta de nuevo en ${Math.ceil(resetIn / 60)} minutos.` },
      { status: 429 }
    );
  }

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para enviar un reclamo." },
      { status: 401 }
    );
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "El servicio de email no está configurado." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido." },
      { status: 400 }
    );
  }

  const parsed = sendComplaintSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  const { analysis, nombre, email, empresaEmail, complaintText, caseId } =
    parsed.data;

  const results = { complaint: false, confirmation: false };

  try {
    // 1. Send complaint to the company
    const complaintHtml = buildComplaintEmailHtml({
      analysis,
      nombre,
      email,
      complaintText,
    });

    const resend = getResend();

    const { error: complaintError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [empresaEmail],
      replyTo: email,
      subject: `Reclamo Formal - ${analysis.producto_servicio} - ${nombre}`,
      html: complaintHtml,
    });

    if (complaintError) {
      throw new Error(complaintError.message);
    }
    results.complaint = true;

    // 2. Send confirmation to the user
    const confirmationHtml = buildUserConfirmationHtml(
      nombre,
      analysis.empresa
    );

    const { error: confirmError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `Tu reclamo contra ${analysis.empresa} fue enviado`,
      html: confirmationHtml,
    });

    if (confirmError) {
      log.warn({ error: confirmError.message }, "Confirmation email failed");
    } else {
      results.confirmation = true;
    }

    // 3. Update case status if we have a caseId
    if (caseId) {
      await fetch(new URL(`/api/cases/${caseId}`, request.url), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "enviado_empresa" }),
      });
    }

    // 4. Fire-and-forget: notify empresa via portal (if registered)
    notifyEmpresaNewComplaint({
      empresaNombre: analysis.empresa,
      consumidorNombre: nombre,
      productoServicio: analysis.producto_servicio,
      montoReclamo: analysis.monto_reclamo,
      pais: analysis.pais_detectado,
      coreGrievance: analysis.core_grievance,
    }).catch(() => {}); // swallow — non-critical

    log.info(
      { empresa: analysis.empresa, caseId, complaint: results.complaint, confirmation: results.confirmation },
      "Complaint sent"
    );

    return NextResponse.json({
      success: true,
      message: "Reclamo enviado exitosamente.",
      results,
    });
  } catch (err) {
    logError("Resend error", err, { route: "/api/send-complaint", empresa: analysis.empresa });
    const message =
      err instanceof Error ? err.message : "Error al enviar el email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
