/**
 * Notification service for bidirectional email alerts.
 *
 * - notifyEmpresaNewComplaint: when a consumer files a complaint
 * - notifyConsumerResponse: when a company responds to a complaint
 *
 * All notifications are fire-and-forget (async, non-blocking).
 * Failures are logged but never block the main flow.
 */

import { Resend } from "resend";
import { clerkClient } from "@clerk/nextjs/server";
import { supabase } from "./supabase";
import {
  buildNewComplaintAlertHtml,
  buildCompanyResponseAlertHtml,
} from "./email/templates";
import { normalizeEmpresaName } from "./empresa";
import { logError } from "./logger";

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "JustIA Consumidor <noreply@justia-consumidor.com>";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://justia-consumidor.vercel.app";

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

// ── Notify empresa when a new complaint is filed ──

interface NotifyEmpresaParams {
  readonly empresaNombre: string;
  readonly consumidorNombre: string;
  readonly productoServicio: string;
  readonly montoReclamo: number;
  readonly pais: "AR" | "MX";
  readonly coreGrievance: string;
}

/**
 * Find the empresa's contact email by matching the company name
 * against registered company accounts.
 */
async function findEmpresaEmail(
  empresaNombre: string
): Promise<string | null> {
  const normalized = normalizeEmpresaName(empresaNombre);
  const words = normalized.split(" ").filter((w) => w.length > 2);
  const searchPattern =
    words.length > 0 ? `%${words[0]}%` : `%${normalized}%`;

  const { data } = await supabase
    .from("company_accounts")
    .select("email_contacto")
    .eq("activa", true)
    .ilike("nombre_normalizado", searchPattern)
    .limit(1)
    .single();

  return (data as { email_contacto: string | null } | null)
    ?.email_contacto ?? null;
}

export async function notifyEmpresaNewComplaint(
  params: NotifyEmpresaParams
): Promise<void> {
  try {
    const resend = getResend();
    if (!resend) return;

    const empresaEmail = await findEmpresaEmail(params.empresaNombre);
    if (!empresaEmail) return; // empresa not registered, can't notify

    const html = buildNewComplaintAlertHtml({
      ...params,
      portalUrl: `${BASE_URL}/empresa`,
    });

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [empresaEmail],
      subject: `Nuevo reclamo recibido - ${params.productoServicio}`,
      html,
    });
  } catch (err) {
    logError("Error notifying empresa", err, { context: "notifyEmpresaNewComplaint" });
  }
}

// ── Notify consumer when empresa responds ──

interface NotifyConsumerParams {
  readonly caseId: string;
  readonly empresaNombre: string;
  readonly tipoRespuesta:
    | "aceptar"
    | "rechazar"
    | "propuesta"
    | "solicitar_info";
  readonly mensaje: string;
  readonly propuestaMonto: number | null;
}

/**
 * Look up the consumer's email and userId from the case via Clerk.
 */
async function findConsumerEmail(
  caseId: string
): Promise<{
  userId: string;
  email: string;
  nombre: string;
  pais: "AR" | "MX";
} | null> {
  const { data: caseData } = await supabase
    .from("cases")
    .select("user_id, pais_detectado")
    .eq("id", caseId)
    .single();

  if (!caseData) return null;

  const record = caseData as {
    user_id: string | null;
    pais_detectado: "AR" | "MX" | null;
  };

  if (!record.user_id) return null;

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(record.user_id);
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) return null;

    const nombre =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || "Usuario";

    return {
      userId: record.user_id,
      email,
      nombre,
      pais: record.pais_detectado ?? "AR",
    };
  } catch {
    return null;
  }
}

// ── In-app notification helpers ───────────────────────────────────────────────

export type InAppNotificationType =
  | "company_response"
  | "status_change"
  | "ai_update"
  | "escalacion"
  | "sistema";

interface InAppNotificationParams {
  readonly userId: string;
  readonly caseId?: string;
  readonly tipo: InAppNotificationType;
  readonly titulo: string;
  readonly mensaje: string;
}

/**
 * Insert a row in the notifications table.
 * Fire-and-forget — never throws.
 */
export async function createInAppNotification(
  params: InAppNotificationParams
): Promise<void> {
  try {
    await supabase.from("notifications").insert({
      user_id: params.userId,
      case_id: params.caseId ?? null,
      tipo: params.tipo,
      titulo: params.titulo,
      mensaje: params.mensaje,
    });
  } catch (err) {
    logError("Error creating in-app notification", err, { context: "createInAppNotification" });
  }
}

/** Titles and messages for each case status transition. */
export function buildStatusChangeNotification(
  status: string,
  empresa: string | null
): { titulo: string; mensaje: string } {
  const company = empresa ?? "la empresa";
  switch (status) {
    case "reclamo_generado":
      return {
        titulo: "Reclamo generado",
        mensaje: `Tu documento de reclamo formal contra ${company} está listo para enviar.`,
      };
    case "enviado_empresa":
      return {
        titulo: "Reclamo enviado",
        mensaje: `Tu reclamo fue enviado formalmente a ${company}. Esperamos su respuesta.`,
      };
    case "en_mediacion":
      return {
        titulo: "Mediación iniciada",
        mensaje: `El proceso de mediación con ${company} está activo. Te notificaremos novedades.`,
      };
    case "escalado":
      return {
        titulo: "Caso escalado",
        mensaje: `Tu caso fue escalado al organismo de defensa del consumidor para mayor seguimiento.`,
      };
    case "resuelto":
      return {
        titulo: "¡Caso resuelto!",
        mensaje: `Tu reclamo contra ${company} fue resuelto. Consultá los detalles en tu caso.`,
      };
    default:
      return {
        titulo: "Actualización de caso",
        mensaje: `El estado de tu caso con ${company} fue actualizado.`,
      };
  }
}

// ── Welcome email when a company first registers ──────────────────────────────

interface NotifyEmpresaWelcomeParams {
  readonly empresaNombre: string;
  readonly emailContacto: string;
  readonly pendingCount: number;
}

/**
 * Send a welcome email to a newly registered company.
 * If there are pending complaints they haven't seen yet, summarise them.
 */
export async function notifyEmpresaWelcome(
  params: NotifyEmpresaWelcomeParams
): Promise<void> {
  try {
    const resend = getResend();
    if (!resend) return;

    const { empresaNombre, emailContacto, pendingCount } = params;
    const pendingLine =
      pendingCount > 0
        ? `<p style="margin:0 0 12px">Encontramos <strong>${pendingCount} reclamo${pendingCount !== 1 ? "s" : ""} pendiente${pendingCount !== 1 ? "s" : ""}</strong> de consumidores que ya te esperan en tu panel.</p>`
        : `<p style="margin:0 0 12px">Por ahora no hay reclamos pendientes. Te avisaremos en cuanto llegue uno.</p>`;

    const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Bienvenida a JustIA Consumidor</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e2e8f0">
        <tr><td style="background:linear-gradient(135deg,#1e40af,#7c3aed);padding:32px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:22px">⚖️ JustIA Consumidor</h1>
          <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px">Portal de Empresas</p>
        </td></tr>
        <tr><td style="padding:32px">
          <h2 style="margin:0 0 16px;color:#1e293b;font-size:20px">¡Bienvenida, ${empresaNombre}!</h2>
          <p style="margin:0 0 12px;color:#475569">Tu cuenta fue creada exitosamente en el portal de empresas de JustIA Consumidor.</p>
          ${pendingLine}
          <div style="text-align:center;margin:28px 0">
            <a href="${BASE_URL}/empresa" style="background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">
              Ver mi panel →
            </a>
          </div>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
          <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center">
            Desde tu panel podés ver cada reclamo en detalle, responder directamente al consumidor y hacer seguimiento del estado de cada caso.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [emailContacto],
      subject: `Bienvenida a JustIA Consumidor${pendingCount > 0 ? ` — ${pendingCount} reclamo${pendingCount !== 1 ? "s" : ""} te esperan` : ""}`,
      html,
    });
  } catch (err) {
    logError("Error sending empresa welcome email", err, { context: "notifyEmpresaWelcome" });
  }
}

export async function notifyConsumerResponse(
  params: NotifyConsumerParams
): Promise<void> {
  try {
    const resend = getResend();
    if (!resend) return;

    const consumer = await findConsumerEmail(params.caseId);
    if (!consumer) return;

    const SUBJECT_MAP: Record<string, string> = {
      aceptar: `${params.empresaNombre} acepto tu reclamo`,
      propuesta: `${params.empresaNombre} te envio una propuesta`,
      solicitar_info: `${params.empresaNombre} solicita mas informacion`,
      rechazar: `Respuesta de ${params.empresaNombre} a tu reclamo`,
    };

    const html = buildCompanyResponseAlertHtml({
      consumidorNombre: consumer.nombre,
      empresaNombre: params.empresaNombre,
      tipoRespuesta: params.tipoRespuesta,
      mensaje: params.mensaje,
      propuestaMonto: params.propuestaMonto,
      pais: consumer.pais,
      casosUrl: `${BASE_URL}/mis-casos`,
    });

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [consumer.email],
      subject: SUBJECT_MAP[params.tipoRespuesta] ?? `Respuesta de ${params.empresaNombre}`,
      html,
    });

    // Also create an in-app notification
    const IN_APP_TITLES: Record<string, string> = {
      aceptar: `${params.empresaNombre} aceptó tu reclamo`,
      propuesta: `${params.empresaNombre} te envió una propuesta`,
      solicitar_info: `${params.empresaNombre} solicita más información`,
      rechazar: `${params.empresaNombre} respondió tu reclamo`,
    };
    const IN_APP_MESSAGES: Record<string, string> = {
      aceptar: `¡Buenas noticias! ${params.empresaNombre} aceptó tu reclamo. Revisá los detalles en tu caso.`,
      propuesta: `${params.empresaNombre} te hizo una propuesta de resolución. Revisá y respondé desde tu caso.`,
      solicitar_info: `${params.empresaNombre} necesita más información de tu parte para avanzar con tu reclamo.`,
      rechazar: `${params.empresaNombre} respondió tu reclamo. Podés ver su respuesta y decidir cómo proceder.`,
    };
    await createInAppNotification({
      userId: consumer.userId,
      caseId: params.caseId,
      tipo: "company_response",
      titulo: IN_APP_TITLES[params.tipoRespuesta] ?? `Respuesta de ${params.empresaNombre}`,
      mensaje: IN_APP_MESSAGES[params.tipoRespuesta] ?? `${params.empresaNombre} respondió tu reclamo.`,
    });
  } catch (err) {
    logError("Error notifying consumer", err, { context: "notifyConsumerResponse" });
  }
}
