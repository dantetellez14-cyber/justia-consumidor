import type { CaseWithResponses } from "@/lib/supabase";

const STATUS_LABELS: Record<string, string> = {
  consulta_recibida: "Consulta recibida",
  reclamo_generado: "Reclamo generado",
  enviado_empresa: "Enviado a empresa",
  en_mediacion: "En mediación",
  escalado: "Escalado a organismo",
  resuelto: "Resuelto",
};

const TIPO_EMPRESA_LABEL: Record<string, string> = {
  aceptar: "Acepta el reclamo",
  propuesta: "Propuesta de resolución",
  solicitar_info: "Solicita más información",
  rechazar: "Rechaza el reclamo",
};

const TIPO_CONSUMER_LABEL: Record<string, string> = {
  aceptar: "Acepta la propuesta",
  rechazar: "Rechaza la propuesta",
  contraofertar: "Contraoferta",
  mensaje: "Mensaje",
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtCurrency(amount: number, pais: string | null): string {
  const currency = pais === "MX" ? "MXN" : "ARS";
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br/>");
}

export function generateCaseReportHtml(c: CaseWithResponses): string {
  const pct = c.probabilidad_exito !== null ? Math.round(c.probabilidad_exito * 100) : null;
  const pctColor = pct === null ? "#64748b" : pct >= 70 ? "#059669" : pct >= 50 ? "#d97706" : "#dc2626";
  const statusLabel = STATUS_LABELS[c.status] ?? c.status;
  const countryName = c.pais_detectado === "MX" ? "México" : "Argentina";
  const generatedAt = fmtDate(new Date().toISOString());
  const caseCreated = fmtDate(c.created_at);

  const companyResponsesHtml = c.company_responses.length > 0
    ? c.company_responses.map((r) => `
      <div class="message empresa-msg">
        <div class="msg-header">
          <span class="msg-sender">Empresa</span>
          <span class="msg-type empresa-type">${escHtml(TIPO_EMPRESA_LABEL[r.tipo_respuesta] ?? r.tipo_respuesta)}</span>
          <span class="msg-date">${fmtDate(r.created_at)}</span>
        </div>
        <p>${escHtml(r.mensaje)}</p>
        ${r.propuesta_monto != null ? `<p class="proposal-amount">Propuesta: ${fmtCurrency(r.propuesta_monto, c.pais_detectado)}</p>` : ""}
      </div>`).join("")
    : `<p class="no-data">Sin respuestas de la empresa todavía.</p>`;

  const consumerResponsesHtml = c.consumer_responses.length > 0
    ? c.consumer_responses.map((r) => `
      <div class="message consumer-msg">
        <div class="msg-header">
          <span class="msg-sender">Consumidor</span>
          <span class="msg-type consumer-type">${escHtml(TIPO_CONSUMER_LABEL[r.tipo_respuesta] ?? r.tipo_respuesta)}</span>
          <span class="msg-date">${fmtDate(r.created_at)}</span>
        </div>
        <p>${escHtml(r.mensaje)}</p>
        ${r.monto_contraoferta != null ? `<p class="proposal-amount">Contraoferta: ${fmtCurrency(r.monto_contraoferta, c.pais_detectado)}</p>` : ""}
      </div>`).join("")
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Reporte de Caso — ${escHtml(c.empresa ?? "Sin empresa")} — JustIA Consumidor</title>
<style>
  @page { size: A4; margin: 2.2cm 2.5cm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10.5pt; color: #1e293b; line-height: 1.55; }

  /* Header */
  .report-header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid #6366f1; padding-bottom: 14pt; margin-bottom: 20pt; }
  .brand { display: flex; align-items: center; gap: 10pt; }
  .brand-icon { width: 34pt; height: 34pt; background: linear-gradient(135deg, #a855f7, #6366f1); border-radius: 8pt; display: flex; align-items: center; justify-content: center; }
  .brand-icon span { color: #fff; font-size: 16pt; font-weight: 900; }
  .brand-name { font-size: 14pt; font-weight: 700; color: #1e293b; }
  .brand-sub { font-size: 8.5pt; color: #64748b; }
  .report-meta { text-align: right; font-size: 8.5pt; color: #64748b; }
  .report-meta strong { display: block; font-size: 10pt; color: #1e293b; margin-bottom: 3pt; }

  /* Case ID badge */
  .case-badge { display: inline-block; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4pt; padding: 4pt 10pt; font-size: 8pt; font-weight: 600; color: #475569; letter-spacing: 0.05em; margin-bottom: 14pt; }

  /* Section */
  .section { margin-bottom: 18pt; }
  .section-title { font-size: 8pt; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.12em; border-bottom: 1px solid #e2e8f0; padding-bottom: 5pt; margin-bottom: 10pt; }

  /* Info grid */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8pt; }
  .info-grid.cols3 { grid-template-columns: 1fr 1fr 1fr; }
  .info-item { }
  .info-label { font-size: 8pt; color: #64748b; margin-bottom: 2pt; }
  .info-value { font-size: 10pt; font-weight: 600; color: #1e293b; }

  /* Status badge */
  .status-badge { display: inline-flex; align-items: center; gap: 5pt; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12pt; padding: 3pt 10pt; font-size: 9pt; font-weight: 600; color: #15803d; }

  /* Probability */
  .prob-block { display: flex; align-items: center; gap: 12pt; }
  .prob-number { font-size: 28pt; font-weight: 300; }
  .prob-bar-wrap { flex: 1; }
  .prob-bar-bg { height: 6pt; background: #f1f5f9; border-radius: 3pt; overflow: hidden; }
  .prob-bar-fill { height: 100%; border-radius: 3pt; }
  .prob-label { font-size: 8pt; color: #64748b; margin-top: 3pt; }

  /* Legal analysis */
  .legal-text { font-size: 9.5pt; color: #334155; line-height: 1.7; background: #f8fafc; border-left: 3pt solid #6366f1; padding: 10pt 12pt; border-radius: 0 4pt 4pt 0; }

  /* Messages */
  .message { border-radius: 6pt; padding: 10pt; margin-bottom: 8pt; page-break-inside: avoid; }
  .empresa-msg { background: #f8fafc; border: 1pt solid #e2e8f0; }
  .consumer-msg { background: #eff6ff; border: 1pt solid #bfdbfe; }
  .msg-header { display: flex; align-items: center; gap: 8pt; margin-bottom: 6pt; flex-wrap: wrap; }
  .msg-sender { font-weight: 700; font-size: 9pt; color: #1e293b; }
  .msg-type { font-size: 8pt; font-weight: 600; padding: 1pt 7pt; border-radius: 8pt; }
  .empresa-type { background: #f0fdf4; color: #15803d; }
  .consumer-type { background: #eff6ff; color: #1d4ed8; }
  .msg-date { font-size: 7.5pt; color: #94a3b8; margin-left: auto; }
  .proposal-amount { margin-top: 6pt; font-weight: 700; color: #059669; font-size: 9.5pt; }

  .no-data { font-size: 9pt; color: #94a3b8; font-style: italic; }

  /* Footer */
  .report-footer { margin-top: 24pt; padding-top: 10pt; border-top: 1pt solid #e2e8f0; display: flex; justify-content: space-between; font-size: 8pt; color: #94a3b8; }

  @media print { .no-print { display: none; } }
</style>
</head>
<body>

<!-- Header -->
<div class="report-header">
  <div class="brand">
    <div class="brand-icon"><span>J</span></div>
    <div>
      <div class="brand-name">JustIA Consumidor</div>
      <div class="brand-sub">Resolución Inteligente de Disputas</div>
    </div>
  </div>
  <div class="report-meta">
    <strong>Reporte de Caso</strong>
    Generado: ${generatedAt}<br/>
    País: ${countryName}
  </div>
</div>

<!-- Case ID -->
<div class="case-badge">CASO #${c.id.slice(0, 8).toUpperCase()}</div>

<!-- Case info -->
<div class="section">
  <div class="section-title">Información del Caso</div>
  <div class="info-grid cols3">
    <div class="info-item">
      <div class="info-label">Empresa</div>
      <div class="info-value">${escHtml(c.empresa ?? "No especificada")}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Producto / Servicio</div>
      <div class="info-value">${escHtml(c.producto_servicio ?? "No especificado")}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Fecha del incidente</div>
      <div class="info-value">${escHtml(c.fecha_incidente ?? "No especificada")}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Monto reclamado</div>
      <div class="info-value">${c.monto_reclamo != null ? fmtCurrency(c.monto_reclamo, c.pais_detectado) : "No especificado"}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Fecha de registro</div>
      <div class="info-value">${caseCreated}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Estado actual</div>
      <div><span class="status-badge">${escHtml(statusLabel)}</span></div>
    </div>
  </div>
</div>

<!-- Core grievance -->
${c.core_grievance ? `
<div class="section">
  <div class="section-title">Motivo del Reclamo</div>
  <p style="font-size:10pt; color:#334155; line-height:1.7;">${escHtml(c.core_grievance)}</p>
</div>` : ""}

<!-- AI Analysis -->
<div class="section">
  <div class="section-title">Análisis de Inteligencia Artificial</div>
  ${pct !== null ? `
  <div style="margin-bottom:12pt;">
    <div class="info-label" style="margin-bottom:6pt;">Probabilidad de éxito estimada</div>
    <div class="prob-block">
      <div class="prob-number" style="color:${pctColor};">${pct}%</div>
      <div class="prob-bar-wrap">
        <div class="prob-bar-bg">
          <div class="prob-bar-fill" style="width:${pct}%; background:${pctColor};"></div>
        </div>
        <div class="prob-label">${pct >= 70 ? "Alta probabilidad de éxito" : pct >= 50 ? "Probabilidad moderada" : "Probabilidad baja — considerar negociación"}</div>
      </div>
    </div>
  </div>` : ""}
  ${c.analisis_legal ? `
  <div class="info-label" style="margin-bottom:6pt;">Análisis legal</div>
  <div class="legal-text">${escHtml(c.analisis_legal)}</div>` : ""}
</div>

<!-- Conversation -->
<div class="section">
  <div class="section-title">Conversación con la Empresa</div>
  ${companyResponsesHtml}
  ${consumerResponsesHtml}
</div>

<!-- Footer -->
<div class="report-footer">
  <span>JustIA Consumidor — justia-consumidor.vercel.app</span>
  <span>Reporte generado automáticamente. No constituye asesoramiento legal.</span>
</div>

</body>
</html>`;
}

export function downloadCaseReportPdf(c: CaseWithResponses): void {
  const html = generateCaseReportHtml(c);
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 500);
}
