"use client";

import { useState } from "react";
import { CaseAnalysis } from "@/lib/types";
import { FileText, Download, Mail, Save, Pencil, Send, CheckCircle2, AlertCircle, Building2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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

export function ComplaintGenerator({ analysis, caseId, onNext }: Props) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [empresaEmail, setEmpresaEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

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
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Reclamo Formal Generado
            </h3>
            <p className="text-sm text-slate-500">
              Completá tus datos y descargá la nota lista para enviar.
            </p>
          </div>
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
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-shadow hover:shadow-lg"
          >
            <Download className="h-4 w-4" />
            Descargar Reclamo
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
            {saved ? "Copiado!" : "Copiar Texto"}
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
