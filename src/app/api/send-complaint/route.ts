import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";
import {
  buildComplaintEmailHtml,
  buildUserConfirmationHtml,
} from "@/lib/email/templates";
import type { CaseAnalysis } from "@/lib/types";

function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "JustIA Consumidor <noreply@justia-consumidor.com>";

interface SendComplaintBody {
  analysis: CaseAnalysis;
  nombre: string;
  email: string;
  empresaEmail: string;
  complaintText: string;
  caseId: string | null;
}

export async function POST(request: NextRequest) {
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

  const body: SendComplaintBody = await request.json();
  const { analysis, nombre, email, empresaEmail, complaintText, caseId } = body;

  if (!nombre || !email) {
    return NextResponse.json(
      { error: "Nombre y email son requeridos." },
      { status: 400 }
    );
  }

  if (!empresaEmail) {
    return NextResponse.json(
      { error: "El email de la empresa es requerido." },
      { status: 400 }
    );
  }

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
    const confirmationHtml = buildUserConfirmationHtml(nombre, analysis.empresa);

    const { error: confirmError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `Tu reclamo contra ${analysis.empresa} fue enviado`,
      html: confirmationHtml,
    });

    if (confirmError) {
      console.error("Confirmation email failed:", confirmError.message);
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

    return NextResponse.json({
      success: true,
      message: "Reclamo enviado exitosamente.",
      results,
    });
  } catch (err) {
    console.error("Resend error:", err);
    const message =
      err instanceof Error ? err.message : "Error al enviar el email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
