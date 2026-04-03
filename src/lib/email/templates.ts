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

export function buildUserConfirmationHtml(nombre: string, empresa: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background-color:#f8fafc;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);border-radius:12px 12px 0 0;padding:24px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;">JustIA Consumidor</h1>
    </div>
    <div style="background:#ffffff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
      <h2 style="color:#1e293b;font-size:18px;">Hola ${escapeHtml(nombre)},</h2>
      <p style="color:#475569;font-size:14px;line-height:1.6;">
        Tu reclamo formal contra <strong>${escapeHtml(empresa)}</strong> ha sido enviado exitosamente.
      </p>
      <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="color:#065f46;font-size:13px;margin:0;">
          <strong>Proximos pasos:</strong><br>
          La empresa tiene 10 dias habiles para responder. Si no obtienes respuesta,
          podes iniciar una mediacion a traves de nuestra plataforma.
        </p>
      </div>
      <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:24px;">
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
    .replace(/"/g, "&quot;");
}
