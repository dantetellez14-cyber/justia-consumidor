import type { CaseAnalysis } from "@/lib/types";

interface ComplaintEmailData {
  readonly analysis: CaseAnalysis;
  readonly nombre: string;
  readonly email: string;
  readonly complaintText: string;
}

export function buildComplaintEmailHtml({
  analysis,
  nombre,
  email,
  complaintText,
}: ComplaintEmailData): string {
  const pais = analysis.pais_detectado === "MX" ? "Mexico" : "Argentina";
  const moneda = analysis.pais_detectado === "MX" ? "MXN" : "ARS";

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background-color:#f8fafc;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);border-radius:12px 12px 0 0;padding:24px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;">JustIA Consumidor</h1>
      <p style="color:#e0e7ff;margin:4px 0 0;font-size:13px;">Reclamo Formal de Consumidor</p>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:24px;border:1px solid #e2e8f0;border-top:none;">
      <p style="color:#475569;font-size:14px;line-height:1.6;">
        Se ha presentado un reclamo formal a traves de la plataforma JustIA Consumidor.
      </p>

      <!-- Summary -->
      <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin:16px 0;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;color:#334155;">
          <tr>
            <td style="padding:4px 8px;font-weight:600;">Consumidor:</td>
            <td style="padding:4px 8px;">${escapeHtml(nombre)}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px;font-weight:600;">Email:</td>
            <td style="padding:4px 8px;">${escapeHtml(email)}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px;font-weight:600;">Empresa:</td>
            <td style="padding:4px 8px;">${escapeHtml(analysis.empresa)}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px;font-weight:600;">Producto/Servicio:</td>
            <td style="padding:4px 8px;">${escapeHtml(analysis.producto_servicio)}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px;font-weight:600;">Monto:</td>
            <td style="padding:4px 8px;">${moneda} $${analysis.monto_reclamo.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px;font-weight:600;">Pais:</td>
            <td style="padding:4px 8px;">${pais}</td>
          </tr>
        </table>
      </div>

      <!-- Complaint text -->
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0;">
        <h3 style="margin:0 0 8px;font-size:13px;color:#92400e;text-transform:uppercase;">Texto del Reclamo</h3>
        <pre style="white-space:pre-wrap;font-family:'Courier New',monospace;font-size:12px;color:#451a03;line-height:1.5;margin:0;">${escapeHtml(complaintText)}</pre>
      </div>

      <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:24px;">
        Este reclamo fue generado a traves de JustIA Consumidor &mdash; Plataforma ODR con IA.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f1f5f9;border-radius:0 0 12px 12px;padding:16px;text-align:center;border:1px solid #e2e8f0;border-top:none;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">
        &copy; ${new Date().getFullYear()} JustIA Consumidor. Todos los derechos reservados.
      </p>
    </div>
  </div>
</body>
</html>`;
}

interface ConfirmationEmailData {
  readonly nombre: string;
  readonly analysis: CaseAnalysis;
  readonly complaintText: string;
}

export function buildUserConfirmationHtml({
  nombre,
  analysis,
  complaintText,
}: ConfirmationEmailData): string {
  const moneda = analysis.pais_detectado === "MX" ? "MXN" : "ARS";
  const pais = analysis.pais_detectado === "MX" ? "México" : "Argentina";
  const fecha = new Date().toLocaleDateString("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pctLabel = Math.round(analysis.probabilidad_exito * 100);
  const pctColor =
    pctLabel >= 70 ? "#059669" : pctLabel >= 50 ? "#d97706" : "#dc2626";

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background-color:#f8fafc;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);border-radius:12px 12px 0 0;padding:28px 24px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">JustIA Consumidor</h1>
      <p style="color:#c7d2fe;margin:6px 0 0;font-size:13px;">Copia de tu reclamo formal · ${fecha}</p>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;">

      <h2 style="color:#1e293b;font-size:20px;margin:0 0 6px;font-weight:700;">Hola ${escapeHtml(nombre)},</h2>
      <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 20px;">
        Tu reclamo formal contra <strong>${escapeHtml(analysis.empresa)}</strong> ha sido generado exitosamente.
        Esta es tu copia para referencia.
      </p>

      <!-- Summary card -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:20px;">
        <div style="background:#1e293b;padding:10px 16px;">
          <p style="color:#94a3b8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0;">Resumen del Reclamo</p>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:10px 16px;font-weight:600;color:#64748b;width:40%;">Empresa</td>
            <td style="padding:10px 16px;color:#1e293b;font-weight:700;">${escapeHtml(analysis.empresa)}</td>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0;background:#fafafa;">
            <td style="padding:10px 16px;font-weight:600;color:#64748b;">Producto / Servicio</td>
            <td style="padding:10px 16px;color:#1e293b;">${escapeHtml(analysis.producto_servicio)}</td>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:10px 16px;font-weight:600;color:#64748b;">Monto reclamado</td>
            <td style="padding:10px 16px;color:#1e293b;font-weight:700;font-size:15px;">${moneda}&nbsp;$${analysis.monto_reclamo.toLocaleString("es")}</td>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0;background:#fafafa;">
            <td style="padding:10px 16px;font-weight:600;color:#64748b;">Fecha del incidente</td>
            <td style="padding:10px 16px;color:#1e293b;">${escapeHtml(analysis.fecha_incidente)}</td>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:10px 16px;font-weight:600;color:#64748b;">País</td>
            <td style="padding:10px 16px;color:#1e293b;">${pais}</td>
          </tr>
          <tr>
            <td style="padding:10px 16px;font-weight:600;color:#64748b;">Prob. de éxito estimada</td>
            <td style="padding:10px 16px;font-weight:700;color:${pctColor};font-size:15px;">${pctLabel}%</td>
          </tr>
        </table>
      </div>

      <!-- Grievance -->
      <div style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:20px;">
        <p style="color:#1e40af;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Descripción del reclamo</p>
        <p style="color:#1e3a8a;font-size:13px;line-height:1.7;margin:0;">${escapeHtml(analysis.core_grievance)}</p>
      </div>

      <!-- Legal basis -->
      <div style="background:#fefce8;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:20px;">
        <p style="color:#92400e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Fundamento legal</p>
        <p style="color:#78350f;font-size:13px;line-height:1.7;margin:0;">${escapeHtml(analysis.analisis_legal)}</p>
      </div>

      <!-- Full complaint text -->
      <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="color:#475569;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Texto completo del reclamo formal</p>
        <pre style="white-space:pre-wrap;font-family:'Courier New',Courier,monospace;font-size:11.5px;color:#334155;line-height:1.6;margin:0;background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;padding:14px;">${escapeHtml(complaintText)}</pre>
      </div>

      <!-- Next steps -->
      <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="color:#065f46;font-size:13px;font-weight:700;margin:0 0 8px;">✅ Próximos pasos</p>
        <ul style="color:#047857;font-size:13px;line-height:1.8;margin:0;padding-left:20px;">
          <li>La empresa tiene <strong>10 días hábiles</strong> para responder.</li>
          <li>Si no hay respuesta, podés iniciar una <strong>mediación gratuita</strong> desde la plataforma.</li>
          <li>Guardá este correo como respaldo de tu reclamo.</li>
        </ul>
      </div>

      <p style="color:#94a3b8;font-size:11px;text-align:center;margin:0;">
        &copy; ${new Date().getFullYear()} JustIA Consumidor &mdash; Plataforma ODR con IA para ${pais}
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f1f5f9;border-radius:0 0 12px 12px;padding:14px;text-align:center;border:1px solid #e2e8f0;border-top:none;">
      <p style="color:#94a3b8;font-size:10px;margin:0;">
        Este correo es una copia de tu reclamo generado en JustIA Consumidor.
        No respondas a este email &mdash; es enviado automáticamente.
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ── Notification: New complaint alert for empresa ──

interface NewComplaintAlertData {
  readonly empresaNombre: string;
  readonly consumidorNombre: string;
  readonly productoServicio: string;
  readonly montoReclamo: number;
  readonly pais: "AR" | "MX";
  readonly coreGrievance: string;
  readonly portalUrl: string;
}

export function buildNewComplaintAlertHtml(data: NewComplaintAlertData): string {
  const moneda = data.pais === "MX" ? "MXN" : "ARS";

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background-color:#f8fafc;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:linear-gradient(135deg,#059669,#0d9488);border-radius:12px 12px 0 0;padding:24px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;">JustIA Empresas</h1>
      <p style="color:#d1fae5;margin:4px 0 0;font-size:13px;">Nuevo reclamo recibido</p>
    </div>
    <div style="background:#ffffff;padding:24px;border:1px solid #e2e8f0;border-top:none;">
      <p style="color:#475569;font-size:14px;line-height:1.6;">
        Se ha recibido un nuevo reclamo de consumidor contra <strong>${escapeHtml(data.empresaNombre)}</strong>.
      </p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;color:#334155;">
          <tr>
            <td style="padding:4px 8px;font-weight:600;">Consumidor:</td>
            <td style="padding:4px 8px;">${escapeHtml(data.consumidorNombre)}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px;font-weight:600;">Producto/Servicio:</td>
            <td style="padding:4px 8px;">${escapeHtml(data.productoServicio)}</td>
          </tr>
          <tr>
            <td style="padding:4px 8px;font-weight:600;">Monto:</td>
            <td style="padding:4px 8px;">${moneda} $${data.montoReclamo.toLocaleString()}</td>
          </tr>
        </table>
      </div>
      <div style="background:#f1f5f9;border-radius:8px;padding:12px;margin:16px 0;">
        <p style="color:#64748b;font-size:12px;margin:0 0 4px;font-weight:600;">Reclamo del consumidor:</p>
        <p style="color:#334155;font-size:13px;margin:0;line-height:1.5;">${escapeHtml(data.coreGrievance)}</p>
      </div>
      <div style="text-align:center;margin:24px 0 16px;">
        <a href="${escapeHtml(data.portalUrl)}" style="display:inline-block;background:linear-gradient(135deg,#059669,#0d9488);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;">
          Responder en el portal
        </a>
      </div>
      <p style="color:#94a3b8;font-size:11px;text-align:center;">
        Responder proactivamente mejora tu reputacion y reduce costos de litigio.
      </p>
    </div>
    <div style="background:#f1f5f9;border-radius:0 0 12px 12px;padding:16px;text-align:center;border:1px solid #e2e8f0;border-top:none;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">
        &copy; ${new Date().getFullYear()} JustIA Empresas
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ── Notification: Company response alert for consumer ──

interface CompanyResponseAlertData {
  readonly consumidorNombre: string;
  readonly empresaNombre: string;
  readonly tipoRespuesta: "aceptar" | "rechazar" | "propuesta" | "solicitar_info";
  readonly mensaje: string;
  readonly propuestaMonto: number | null;
  readonly pais: "AR" | "MX";
  readonly casosUrl: string;
}

const RESPONSE_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  aceptar: { label: "Reclamo aceptado", color: "#065f46", bgColor: "#ecfdf5" },
  propuesta: { label: "Propuesta de resolucion", color: "#1e40af", bgColor: "#eff6ff" },
  solicitar_info: { label: "Solicitan mas informacion", color: "#92400e", bgColor: "#fefce8" },
  rechazar: { label: "Reclamo rechazado", color: "#991b1b", bgColor: "#fef2f2" },
};

export function buildCompanyResponseAlertHtml(data: CompanyResponseAlertData): string {
  const moneda = data.pais === "MX" ? "MXN" : "ARS";
  const cfg = RESPONSE_LABELS[data.tipoRespuesta] ?? RESPONSE_LABELS.solicitar_info;

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background-color:#f8fafc;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);border-radius:12px 12px 0 0;padding:24px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;">JustIA Consumidor</h1>
      <p style="color:#e0e7ff;margin:4px 0 0;font-size:13px;">Actualizacion de tu reclamo</p>
    </div>
    <div style="background:#ffffff;padding:24px;border:1px solid #e2e8f0;border-top:none;">
      <h2 style="color:#1e293b;font-size:18px;margin:0 0 12px;">Hola ${escapeHtml(data.consumidorNombre)},</h2>
      <p style="color:#475569;font-size:14px;line-height:1.6;">
        <strong>${escapeHtml(data.empresaNombre)}</strong> ha respondido a tu reclamo.
      </p>

      <div style="background:${cfg.bgColor};border-radius:8px;padding:16px;margin:16px 0;">
        <p style="color:${cfg.color};font-size:14px;font-weight:700;margin:0 0 8px;">
          ${cfg.label}
        </p>
        <p style="color:#334155;font-size:13px;margin:0;line-height:1.5;">
          ${escapeHtml(data.mensaje)}
        </p>
        ${data.propuestaMonto !== null ? `
        <p style="color:#059669;font-size:15px;font-weight:700;margin:12px 0 0;">
          Monto propuesto: ${moneda} $${data.propuestaMonto.toLocaleString()}
        </p>` : ""}
      </div>

      ${data.tipoRespuesta === "aceptar" ? `
      <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="color:#065f46;font-size:13px;margin:0;">
          <strong>Tu reclamo fue resuelto.</strong> La empresa acepto tu reclamo.
          Si consideras que la resolucion no es satisfactoria, podes escalar ante
          ${data.pais === "MX" ? "PROFECO" : "COPREC/Defensa del Consumidor"}.
        </p>
      </div>` : ""}

      ${data.tipoRespuesta === "rechazar" ? `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="color:#991b1b;font-size:13px;margin:0;">
          <strong>No te desanimes.</strong> Podes escalar tu reclamo ante
          ${data.pais === "MX" ? "PROFECO o Concilianet" : "COPREC o Defensa del Consumidor"}
          directamente desde nuestra plataforma.
        </p>
      </div>` : ""}

      <div style="text-align:center;margin:24px 0 16px;">
        <a href="${escapeHtml(data.casosUrl)}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;">
          Ver mi caso
        </a>
      </div>
    </div>
    <div style="background:#f1f5f9;border-radius:0 0 12px 12px;padding:16px;text-align:center;border:1px solid #e2e8f0;border-top:none;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">
        &copy; ${new Date().getFullYear()} JustIA Consumidor
      </p>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
