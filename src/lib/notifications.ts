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
    // Fire-and-forget: log but don't throw
    console.error(
      "[notifications] Error notifying empresa:",
      err instanceof Error ? err.message : err
    );
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
 * Look up the consumer's email from the case's user_id via Clerk.
 */
async function findConsumerEmail(
  caseId: string
): Promise<{
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
      email,
      nombre,
      pais: record.pais_detectado ?? "AR",
    };
  } catch {
    return null;
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
  } catch (err) {
    console.error(
      "[notifications] Error notifying consumer:",
      err instanceof Error ? err.message : err
    );
  }
}
