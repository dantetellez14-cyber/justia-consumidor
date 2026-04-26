"use client";

import { useState, useEffect } from "react";
import { CaseAnalysis } from "@/lib/types";
import { FileText, Download, Mail, Save, Pencil, Send, CheckCircle2, AlertCircle, Building2, Loader2, Sparkles, Copy, Share2, Lock, Zap, Shield, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";

interface Props {
  readonly analysis: CaseAnalysis;
  readonly caseId: string | null;
  readonly onNext: () => void;
}

function generateComplaintText(
  analysis: CaseAnalysis,
  nombre: string,
  email: string
): string {
  const fecha = new Date().toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const pais = analysis.pais_detectado === "MX" ? "México" : "Argentina";
  const ley =
    analysis.pais_detectado === "MX"
      ? "Ley Federal de Protección al Consumidor"
      : "Ley 24.240 de Defensa del Consumidor";
  const moneda = analysis.pais_detectado === "MX" ? "MXN" : "ARS";

  return `NOTA DE RECLAMO FORMAL

Fecha: ${fecha}
De: ${nombre || "[Nombre del consumidor]"}
Email: ${email || "[Email de contacto]"}
Para: ${analysis.empresa}

ASUNTO: Reclamo formal por incumplimiento - ${analysis.producto_servicio}

Estimados señores de ${analysis.empresa}:

Por medio de la presente, me dirijo a ustedes en mi carácter de consumidor/a para formular un reclamo formal en relación con el siguiente hecho:

PRODUCTO/SERVICIO: ${analysis.producto_servicio}
FECHA DEL INCIDENTE: ${analysis.fecha_incidente}
MONTO RECLAMADO: ${moneda} $${analysis.monto_reclamo.toLocaleString()}

DESCRIPCIÓN DEL RECLAMO:
${analysis.core_grievance}

FUNDAMENTO LEGAL:
De acuerdo con la ${ley} vigente en ${pais}:
${analysis.analisis_legal}

SOLICITUD:
Solicito que en un plazo no mayor a 10 (diez) días hábiles a partir de la recepción de la presente, se proceda a:

1. Reconocer el incumplimiento señalado.
2. Ofrecer una solución satisfactoria que puede incluir: reparación, sustitución del producto o devolución íntegra del importe abonado.
3. Compensar los daños y perjuicios ocasionados conforme a derecho.

De no obtener una respuesta favorable en el plazo indicado, me reservo el derecho de iniciar las acciones legales correspondientes ante los organismos de defensa del consumidor${analysis.pais_detectado === "MX" ? " (PROFECO)" : " (COPREC/Defensa del Consumidor)"} y/o la vía judicial.

Sin otro particular, saludo atentamente.

${nombre || "[Firma del consumidor]"}
DNI/CURP: [Completar]
Domicilio: [Completar]
Teléfono: [Completar]`;
}

// Sample data for quick testing
const TEST_NOMBRE = "Dante Tellez";
const TEST_EMAIL = "dantetellezao@gmail.com";

// ── Paywall overlay ───────────────────────────────────────────────────────────
function ProPaywall({ empresa, analysis }: { empresa: string; analysis: CaseAnalysis }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");
  const { isSignedIn } = useAuth();

  const handleUpgrade = async () => {
    setErrorMsg(null);

    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }

    setLoading(true);
    try {
      // Persist analysis in localStorage (survives Stripe redirect) so we can restore it after payment
      localStorage.setItem("pendingAnalysis", JSON.stringify(analysis));

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Error al procesar el pago. Intenta de nuevo.");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg("No se pudo iniciar el pago. Intenta de nuevo.");
        setLoading(false);
      }
    } catch {
      setErrorMsg("Error de conexión. Verifica tu internet e intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-xl border border-purple-200 bg-white shadow-xl overflow-hidden"
    >
      {/* Blurred preview of the complaint */}
      <div className="relative px-6 pt-6 pb-0 select-none pointer-events-none">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-600 line-clamp-4">
{`NOTA DE RECLAMO FORMAL

Fecha: ${new Date().toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}
De: [Tu nombre completo]
Para: ${empresa}

ASUNTO: Reclamo formal por incumplimiento...`}
          </pre>
        </div>
        {/* Gradient blur overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Paywall card */}
      <div className="px-6 pb-6 pt-4 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
          <Lock className="h-7 w-7 text-white" />
        </div>

        <h3 className="text-xl font-black text-slate-800">
          Tu reclamo está listo
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Desbloquea el documento completo con JustIA Pro
        </p>

        {/* Plan toggle */}
        <div className="my-5 inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            onClick={() => setPlan("annual")}
            className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition-all ${plan === "annual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Anual
            {plan === "annual" && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                -17%
              </span>
            )}
          </button>
          <button
            onClick={() => setPlan("monthly")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${plan === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Mensual
          </button>
        </div>

        {/* Price */}
        {plan === "annual" ? (
          <div className="mb-1 inline-flex items-end gap-1">
            <span className="text-4xl font-black text-slate-900">$12</span>
            <span className="mb-1 text-base text-slate-500">USD / año</span>
          </div>
        ) : (
          <div className="mb-1 inline-flex items-end gap-1">
            <span className="text-4xl font-black text-slate-900">$1.50</span>
            <span className="mb-1 text-base text-slate-500">USD / mes</span>
          </div>
        )}
        <p className="mb-4 text-xs text-slate-400">
          {plan === "annual" ? "≈ $1/mes · facturado anualmente" : "facturado mensualmente"}
        </p>

        {/* Features */}
        <ul className="mb-6 space-y-2 text-left mx-auto max-w-xs">
          {[
            { icon: FileText, text: "Carta de reclamo formal completa (PDF)" },
            { icon: Send,     text: "Envío directo a la empresa por email" },
            { icon: Shield,   text: "Acceso al módulo de arbitraje IA" },
            { icon: Clock,    text: "Seguimiento del caso en tiempo real" },
            { icon: Zap,      text: "Todos los casos durante 1 año" },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2 text-sm text-slate-600">
              <Icon className="h-4 w-4 shrink-0 text-purple-500" />
              {text}
            </li>
          ))}
        </ul>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold text-white shadow-lg transition-all hover:scale-[1.02] disabled:opacity-70"
          style={{ background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)" }}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
          {loading ? "Redirigiendo..." : plan === "annual" ? "Desbloquear por $12/año" : "Desbloquear por $1.50/mes"}
        </button>

        {errorMsg && (
          <p className="mt-2 text-xs text-red-500 font-medium">{errorMsg}</p>
        )}

        <p className="mt-3 text-xs text-slate-400">
          Pago seguro vía Stripe · Cancela cuando quieras
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function ComplaintGenerator({ analysis, caseId, onNext }: Props) {
  const { isSignedIn } = useAuth();
  const [isPro, setIsPro] = useState<boolean | null>(null); // null = loading
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [empresaEmail, setEmpresaEmail] = useState("");

  useEffect(() => {
    if (!isSignedIn) { setIsPro(false); return; }
    fetch("/api/stripe/status")
      .then((r) => r.json())
      .then((d) => setIsPro(d.isPro === true))
      .catch(() => setIsPro(false));
  }, [isSignedIn]);
  const [saved, setSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingCopy, setSendingCopy] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copyResult, setCopyResult] = useState<{ success: boolean; message: string } | null>(null);

  const loadExample = () => {
    setNombre(TEST_NOMBRE);
    setEmail(TEST_EMAIL);
    setEmpresaEmail(`atencion@${analysis.empresa.toLowerCase().replace(/[\s.]/g, "").slice(0, 20)}.com.ar`);
  };

  const complaintText = generateComplaintText(analysis, nombre, email);

  const handleDownload = () => {
    const blob = new Blob([complaintText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reclamo_${analysis.empresa.replace(/\s+/g, "_")}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    const fecha = new Date().toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const moneda = analysis.pais_detectado === "MX" ? "MXN" : "ARS";

    const printHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Reclamo Formal — ${analysis.empresa}</title>
  <style>
    @page { size: A4; margin: 2.5cm 3cm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #1a1a1a; line-height: 1.6; }
    .header { text-align: center; border-bottom: 2px solid #1e40af; padding-bottom: 12pt; margin-bottom: 24pt; }
    .header h1 { font-size: 16pt; color: #1e40af; letter-spacing: 2px; font-weight: bold; }
    .header p { font-size: 10pt; color: #555; margin-top: 4pt; }
    .meta { margin-bottom: 20pt; }
    .meta p { margin-bottom: 3pt; }
    .meta .label { font-weight: bold; }
    h2 { font-size: 11pt; font-weight: bold; letter-spacing: 1px; color: #1e40af; margin: 20pt 0 8pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 4pt; }
    p { margin-bottom: 8pt; text-align: justify; }
    .summary-table { width: 100%; border-collapse: collapse; margin: 12pt 0; }
    .summary-table td { padding: 6pt 10pt; border: 1px solid #d1d5db; font-size: 11pt; }
    .summary-table td:first-child { font-weight: bold; background: #f8fafc; width: 40%; }
    ol { padding-left: 20pt; margin-bottom: 10pt; }
    ol li { margin-bottom: 4pt; }
    .firma { margin-top: 48pt; }
    .firma .line { border-top: 1px solid #333; width: 200pt; margin-top: 40pt; }
    .firma p { margin-top: 4pt; font-size: 10pt; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>NOTA DE RECLAMO FORMAL</h1>
    <p>Generado por JustIA Consumidor — justia-consumidor.com</p>
  </div>

  <div class="meta">
    <p><span class="label">Fecha:</span> ${fecha}</p>
    <p><span class="label">De:</span> ${nombre || "[Nombre del consumidor]"}</p>
    <p><span class="label">Email:</span> ${email || "[Email de contacto]"}</p>
    <p><span class="label">Para:</span> ${analysis.empresa}</p>
  </div>

  <p><strong>ASUNTO:</strong> Reclamo formal por incumplimiento — ${analysis.producto_servicio}</p>

  <p>Estimados señores de <strong>${analysis.empresa}</strong>:</p>

  <p>Por medio de la presente, me dirijo a ustedes en mi carácter de consumidor/a para formular un reclamo formal en relación con el siguiente hecho:</p>

  <h2>DATOS DEL RECLAMO</h2>
  <table class="summary-table">
    <tr><td>Producto / Servicio</td><td>${analysis.producto_servicio}</td></tr>
    <tr><td>Fecha del Incidente</td><td>${analysis.fecha_incidente}</td></tr>
    <tr><td>Monto Reclamado</td><td>${moneda} $${analysis.monto_reclamo.toLocaleString()}</td></tr>
  </table>

  <h2>DESCRIPCIÓN DEL RECLAMO</h2>
  <p>${analysis.core_grievance}</p>

  <h2>FUNDAMENTO LEGAL</h2>
  <p>${analysis.analisis_legal}</p>

  <h2>SOLICITUD</h2>
  <p>Solicito que en un plazo no mayor a <strong>10 (diez) días hábiles</strong> a partir de la recepción de la presente, se proceda a:</p>
  <ol>
    <li>Reconocer el incumplimiento señalado.</li>
    <li>Ofrecer una solución satisfactoria que puede incluir: reparación, sustitución del producto o devolución íntegra del importe abonado.</li>
    <li>Compensar los daños y perjuicios ocasionados conforme a derecho.</li>
  </ol>
  <p>De no obtener una respuesta favorable en el plazo indicado, me reservo el derecho de iniciar las acciones legales correspondientes ante los organismos de defensa del consumidor${analysis.pais_detectado === "MX" ? " (PROFECO)" : " (COPREC/Defensa del Consumidor)"} y/o la vía judicial.</p>

  <p>Sin otro particular, saludo atentamente.</p>

  <div class="firma">
    <div class="line"></div>
    <p><strong>${nombre || "[Nombre del consumidor]"}</strong></p>
    <p>DNI/CURP: ___________________________</p>
    <p>Domicilio: ___________________________</p>
    <p>Teléfono: ___________________________</p>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(printHtml);
    win.document.close();
    win.focus();
    // Give browser a moment to render before triggering print
    setTimeout(() => {
      win.print();
      win.close();
    }, 400);
  };

  const handleWhatsApp = () => {
    const moneda = analysis.pais_detectado === "MX" ? "MXN" : "ARS";
    const prob = Math.round(analysis.probabilidad_exito * 100);
    const text =
      `⚖️ *Reclamo formal contra ${analysis.empresa}*\n\n` +
      `📌 *Producto/servicio:* ${analysis.producto_servicio}\n` +
      `💰 *Monto reclamado:* ${moneda} $${analysis.monto_reclamo.toLocaleString()}\n` +
      `📊 *Probabilidad de éxito:* ${prob}%\n\n` +
      `_Generado con JustIA Consumidor — justia-consumidor.com_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(complaintText);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(
      `Reclamo formal - ${analysis.producto_servicio}`
    );
    const body = encodeURIComponent(complaintText);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleSendViaResend = async () => {
    if (!nombre.trim() || !email.trim() || !empresaEmail.trim()) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/send-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis,
          nombre,
          email,
          empresaEmail,
          complaintText,
          caseId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendResult({ success: false, message: data.error });
      } else {
        setSendResult({ success: true, message: data.message });
      }
    } catch {
      setSendResult({ success: false, message: "Error de conexion. Intenta de nuevo." });
    } finally {
      setSending(false);
    }
  };

  /** Send the complaint to the consumer's own email — used for testing / personal copy. */
  const handleSendCopyToMe = async () => {
    if (!nombre.trim() || !email.trim()) return;
    setSendingCopy(true);
    setCopyResult(null);
    try {
      const res = await fetch("/api/send-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis,
          nombre,
          email,
          empresaEmail: email, // destination is the consumer's own address
          complaintText,
          caseId,
          sendCopyToConsumer: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCopyResult({ success: false, message: data.error });
      } else {
        setCopyResult({
          success: true,
          message: `Copia enviada a ${email}. Revisá tu bandeja de entrada.`,
        });
      }
    } catch {
      setCopyResult({ success: false, message: "Error de conexion. Intenta de nuevo." });
    } finally {
      setSendingCopy(false);
    }
  };

  // Loading state
  if (isPro === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Paywall — not Pro
  if (!isPro) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <ProPaywall empresa={analysis.empresa} analysis={analysis} />
        <button
          onClick={onNext}
          className="w-full rounded-lg border border-slate-200 bg-white py-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50"
        >
          Continuar sin descargar &rarr;
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800">
              Reclamo Formal Generado
            </h3>
            <p className="text-sm text-slate-500">
              Completá tus datos y descargá la nota lista para enviar.
            </p>
          </div>
          {/* Quick-fill for testing */}
          <button
            type="button"
            onClick={loadExample}
            className="flex shrink-0 items-center gap-1.5 rounded-md bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-600 transition-colors hover:bg-purple-100"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Cargar ejemplo
          </button>
        </div>

        {/* User info fields */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Tu nombre completo
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Pencil className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Juan Pérez"
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Tu email de contacto
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@email.com"
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Company email field */}
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Email de la empresa (para enviar el reclamo directamente)
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            <input
              type="email"
              value={empresaEmail}
              onChange={(e) => setEmpresaEmail(e.target.value)}
              placeholder={`atencion@${analysis.empresa.toLowerCase().replace(/\s+/g, "")}.com`}
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Opcional. Si lo completas, podemos enviar el reclamo directamente a la empresa.
          </p>
        </div>

        {/* Preview */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-600">
            {complaintText}
          </pre>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-3">
          {empresaEmail.trim() && nombre.trim() && email.trim() && (
            <button
              onClick={handleSendViaResend}
              disabled={sending || sendResult?.success === true}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-shadow hover:shadow-lg disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : sendResult?.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {sending ? "Enviando..." : sendResult?.success ? "Enviado" : "Enviar a la empresa"}
            </button>
          )}

          {/* "Send copy to me" — works for testing, no domain check */}
          {nombre.trim() && email.trim() && (
            <button
              onClick={handleSendCopyToMe}
              disabled={sendingCopy || copyResult?.success === true}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-shadow hover:shadow-lg disabled:opacity-50"
            >
              {sendingCopy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : copyResult?.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {sendingCopy
                ? "Enviando..."
                : copyResult?.success
                  ? "Copia enviada"
                  : "Recibir copia en mi correo"}
            </button>
          )}

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-shadow hover:shadow-lg"
          >
            <Download className="h-4 w-4" />
            Descargar PDF
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-shadow hover:shadow-lg"
          >
            <Share2 className="h-4 w-4" />
            Compartir por WhatsApp
          </button>
          <button
            onClick={handleEmail}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Mail className="h-4 w-4" />
            Abrir en Email
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Save className="h-4 w-4" />
            {saved ? "¡Copiado!" : "Copiar Texto"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            title="Descargar como archivo de texto plano"
          >
            <FileText className="h-4 w-4" />
            .txt
          </button>
        </div>

        {/* Send result feedback */}
        {sendResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 flex items-center gap-2 rounded-lg border p-3 text-sm ${
              sendResult.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {sendResult.success ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {sendResult.message}
          </motion.div>
        )}

        {/* Copy-to-me result feedback */}
        {copyResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 flex items-center gap-2 rounded-lg border p-3 text-sm ${
              copyResult.success
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {copyResult.success ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {copyResult.message}
          </motion.div>
        )}
      </div>

      <button
        onClick={onNext}
        className="w-full rounded-lg border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
      >
        Si la empresa no responde, solicitar mediación IA &rarr;
      </button>
    </motion.div>
  );
}
