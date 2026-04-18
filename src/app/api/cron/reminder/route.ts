import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";
import { clerkClient } from "@clerk/nextjs/server";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/cron/reminder");

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "JustIA Consumidor <onboarding@resend.dev>";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://justia-consumidor.vercel.app";

// 10 business days ≈ 14 calendar days
const REMINDER_DAYS = 14;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function buildReminderHtml(
  nombre: string,
  empresa: string,
  pais: "AR" | "MX"
): string {
  const organismo =
    pais === "MX"
      ? "PROFECO (profeco.gob.mx)"
      : "COPREC / Defensa del Consumidor";
  const organismoUrl =
    pais === "MX"
      ? "https://www.profeco.gob.mx"
      : "https://www.argentina.gob.ar/produccion/defensadelconsumidor";

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Recordatorio de reclamo</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e2e8f0">
        <tr><td style="background:linear-gradient(135deg,#b45309,#d97706);padding:28px 32px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;color:#fff;font-size:20px">⏰ Recordatorio de tu reclamo</h1>
          <p style="margin:6px 0 0;color:#fde68a;font-size:13px">JustIA Consumidor</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 12px;color:#1e293b;font-size:16px">Hola <strong>${nombre}</strong>,</p>
          <p style="margin:0 0 16px;color:#475569">
            Han pasado más de <strong>10 días hábiles</strong> desde que enviaste tu reclamo formal a <strong>${empresa}</strong> y todavía no registramos una respuesta de su parte.
          </p>

          <div style="background:#fef3c7;border-left:4px solid #d97706;padding:16px;border-radius:0 8px 8px 0;margin:0 0 20px">
            <p style="margin:0;color:#92400e;font-weight:bold;font-size:14px">¿Qué podés hacer ahora?</p>
          </div>

          <ol style="padding-left:20px;color:#475569;margin:0 0 20px">
            <li style="margin-bottom:8px">
              <strong>Escalar al organismo oficial</strong> — presentá tu queja en <a href="${organismoUrl}" style="color:#2563eb">${organismo}</a>, que tiene poder de multa sobre las empresas.
            </li>
            <li style="margin-bottom:8px">
              <strong>Solicitar mediación</strong> — desde tu panel en JustIA podés activar el módulo de mediación asistida por IA.
            </li>
            <li style="margin-bottom:8px">
              <strong>Enviar una segunda nota</strong> — a veces el primer correo queda perdido; reenviar con copia a organismos reguladores aumenta la presión.
            </li>
          </ol>

          <div style="text-align:center;margin:28px 0">
            <a href="${BASE_URL}/mis-casos" style="background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block">
              Ver mi caso →
            </a>
          </div>

          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
          <p style="margin:0;color:#94a3b8;font-size:11px;text-align:center">
            Este recordatorio fue enviado automáticamente por JustIA Consumidor porque tu reclamo contra ${empresa} no tuvo respuesta en el plazo esperado.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron (or a trusted source)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const resend = getResend();
  if (!resend) {
    log.warn({}, "RESEND_API_KEY not set — skipping reminder cron");
    return NextResponse.json({ skipped: true, reason: "no resend key" });
  }

  // Find cases that have been in 'enviado_empresa' for 14+ calendar days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - REMINDER_DAYS);

  const { data: staleCases, error } = await supabase
    .from("cases")
    .select("id, user_id, empresa, pais_detectado, updated_at")
    .eq("status", "enviado_empresa")
    .lt("updated_at", cutoff.toISOString())
    .limit(50); // cap per run to stay within function timeout

  if (error) {
    log.error({ error: error.message }, "Failed to query stale cases");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!staleCases || staleCases.length === 0) {
    log.info({}, "No stale cases found — nothing to remind");
    return NextResponse.json({ reminded: 0 });
  }

  log.info({ count: staleCases.length }, "Stale cases found — sending reminders");

  const client = await clerkClient();
  let reminded = 0;
  let failed = 0;

  for (const c of staleCases) {
    const record = c as {
      id: string;
      user_id: string | null;
      empresa: string;
      pais_detectado: "AR" | "MX" | null;
      updated_at: string;
    };

    if (!record.user_id) continue;

    try {
      // Get consumer contact info from Clerk
      const user = await client.users.getUser(record.user_id);
      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) continue;

      const nombre =
        [user.firstName, user.lastName].filter(Boolean).join(" ") || "Usuario";
      const pais = record.pais_detectado ?? "AR";

      // Send reminder email
      const { error: emailError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: `⏰ Tu reclamo contra ${record.empresa} no tuvo respuesta — próximos pasos`,
        html: buildReminderHtml(nombre, record.empresa, pais),
      });

      if (emailError) {
        log.warn({ caseId: record.id, error: emailError.message }, "Email failed");
        failed++;
        continue;
      }

      // Advance status so this case is not picked up on the next cron run
      await supabase
        .from("cases")
        .update({ status: "recordatorio_enviado" })
        .eq("id", record.id);

      reminded++;
    } catch (err) {
      log.warn(
        { caseId: record.id, error: err instanceof Error ? err.message : err },
        "Reminder failed for case"
      );
      failed++;
    }
  }

  log.info({ reminded, failed }, "Reminder cron complete");
  return NextResponse.json({ reminded, failed });
}
