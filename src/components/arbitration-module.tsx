"use client";

import { useState } from "react";
import { CaseAnalysis } from "@/lib/types";
import { Users, MessageSquare, CheckCircle, AlertCircle, XCircle, MinusCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  readonly analysis: CaseAnalysis;
  readonly onNext: () => void;
}

type CompanyResponse = "no_response" | "partial" | "custom";

interface VerdictData {
  icon: "check" | "minus" | "x";
  color: "emerald" | "amber" | "red";
  title: string;
  summary: string;
  companyQuote?: string;
  recommendation: string;
  legalBasis: string;
}

/** Keyword-based tone analysis for custom company responses. */
function analyzeCustomResponse(
  text: string,
  analysis: CaseAnalysis,
  moneda: string
): VerdictData {
  const lower = text.toLowerCase();

  // Signals of outright refusal / denial
  const refusalKeywords = [
    "rechaza", "no corresponde", "no procede", "términos y condiciones",
    "no aplica", "no es responsabilidad", "queda rechazado", "no tenemos",
    "no podemos", "sin derecho", "clausula", "cláusula", "exime",
    "descartamos", "negamos", "improcedente",
  ];
  // Signals of a real settlement offer
  const offerKeywords = [
    "ofrecemos", "te ofrecemos", "compensación", "reembolso", "crédito",
    "cupón", "cambio del producto", "devolución", "descuento", "bonificación",
    "acreditamos", "podemos ofrecer",
  ];
  // Signals of hostility / legal threat
  const hostileKeywords = [
    "acciones legales", "demanda", "abogad", "litigio", "proceso judicial",
    "fuerza mayor", "caso fortuito",
  ];

  const isRefusal = refusalKeywords.some((k) => lower.includes(k));
  const hasOffer = offerKeywords.some((k) => lower.includes(k));
  const isHostile = hostileKeywords.some((k) => lower.includes(k));

  // Truncate the quote for display
  const quote = text.trim().slice(0, 220) + (text.trim().length > 220 ? "…" : "");

  if (isRefusal && !hasOffer) {
    return {
      icon: "check",
      color: "emerald",
      title: "El árbitro IA falla a favor del consumidor",
      summary: `La respuesta de ${analysis.empresa} constituye un rechazo sin fundamento legal sólido frente al reclamo presentado. La negativa a reconocer la responsabilidad sin ofrecer alternativa de solución agrava la posición de la empresa.`,
      companyQuote: quote,
      recommendation: `Devolución íntegra de ${moneda} $${analysis.monto_reclamo.toLocaleString()} o reemplazo del producto/servicio, más compensación por el perjuicio ocasionado por la demora y la negativa infundada.`,
      legalBasis: analysis.analisis_legal,
    };
  }

  if (isHostile) {
    return {
      icon: "check",
      color: "emerald",
      title: "Posición de la empresa considerada abusiva",
      summary: `La empresa utilizó lenguaje intimidatorio o amenazas legales en su respuesta, lo cual contradice el espíritu de la legislación de defensa del consumidor que prohíbe prácticas abusivas en la resolución de disputas.`,
      companyQuote: quote,
      recommendation: `Presentar el historial de comunicaciones como evidencia ante el organismo regulador. El tono de la respuesta refuerza la posición del consumidor y puede agravar las consecuencias para la empresa.`,
      legalBasis: analysis.analisis_legal,
    };
  }

  if (hasOffer && !isRefusal) {
    return {
      icon: "minus",
      color: "amber",
      title: "Oferta de la empresa evaluada como insuficiente",
      summary: `${analysis.empresa} realizó una propuesta de compensación, aunque el árbitro IA considera que la misma no cubre la totalidad del daño acreditado. La oferta puede tomarse como punto de partida para una negociación final.`,
      companyQuote: quote,
      recommendation: `Contraoferta por el monto reclamado completo (${moneda} $${analysis.monto_reclamo.toLocaleString()}). Si la empresa no acepta, se recomienda escalar al organismo de mediación correspondiente.`,
      legalBasis: analysis.analisis_legal,
    };
  }

  // Ambiguous / no clear signal → moderate lean toward consumer
  return {
    icon: "check",
    color: "emerald",
    title: "Análisis concluido: posición favorable al consumidor",
    summary: `La respuesta de ${analysis.empresa} no ofrece una solución concreta al reclamo planteado sobre ${analysis.producto_servicio}. La falta de una propuesta clara de resolución mantiene la posición de incumplimiento.`,
    companyQuote: quote,
    recommendation:
      analysis.probabilidad_exito > 0.7
        ? `Devolución íntegra de ${moneda} $${analysis.monto_reclamo.toLocaleString()} o reposición del bien/servicio, con compensación adicional por daños.`
        : `Reparación o compensación parcial equivalente al daño demostrado. Se recomienda solicitar mediación formal.`,
    legalBasis: analysis.analisis_legal,
  };
}

/** Build verdict data from the response type + optional custom text. */
function buildVerdict(
  companyResponse: CompanyResponse,
  customResponse: string,
  analysis: CaseAnalysis,
  moneda: string
): VerdictData {
  if (companyResponse === "no_response") {
    return {
      icon: "check",
      color: "emerald",
      title: "Silencio empresarial: fallo a favor del consumidor",
      summary: `${analysis.empresa} no respondió al reclamo dentro del plazo establecido. En el derecho del consumidor, el silencio ante un reclamo formal se interpreta como incumplimiento y genera una presunción favorable al consumidor.`,
      recommendation:
        analysis.probabilidad_exito > 0.7
          ? `Devolución íntegra de ${moneda} $${analysis.monto_reclamo.toLocaleString()} o cambio del producto, más compensación por el perjuicio causado por la demora.`
          : `Compensación parcial equivalente al daño demostrado. Se recomienda presentar el reclamo ante el organismo regulador.`,
      legalBasis: analysis.analisis_legal,
    };
  }

  if (companyResponse === "partial") {
    return {
      icon: "minus",
      color: "amber",
      title: "Respuesta insatisfactoria: posición mixta",
      summary: `${analysis.empresa} ofreció una solución parcial que no cubre la totalidad del reclamo sobre ${analysis.producto_servicio}. El árbitro IA considera que la propuesta no satisface los estándares mínimos exigidos por la normativa de defensa del consumidor.`,
      recommendation: `Rechazar la oferta parcial y requerir una compensación completa de ${moneda} $${analysis.monto_reclamo.toLocaleString()}. Si la empresa no accede, escalar formalmente ante el organismo de mediación de tu jurisdicción.`,
      legalBasis: analysis.analisis_legal,
    };
  }

  // "custom" — use keyword analysis on the actual text
  return analyzeCustomResponse(customResponse, analysis, moneda);
}

const SAMPLE_COMPANY_RESPONSES = [
  "Estimado cliente, lamentamos su inconveniente. Sin embargo, tras revisar el caso, concluimos que el producto fue utilizado en condiciones no contempladas en nuestra garantía, conforme a los términos y condiciones del contrato. Por lo tanto, queda rechazado el reclamo de garantía.",
  "De acuerdo con nuestras políticas internas, el plazo para realizar devoluciones ya venció. Le ofrecemos un cupón de descuento del 15% para su próxima compra como gesto de buena voluntad.",
  "Hemos analizado su situación y podemos ofrecerle un crédito en su cuenta equivalente al 30% del monto abonado. No podemos realizar el reembolso total ya que el servicio fue parcialmente utilizado.",
  "Le informamos que iniciaremos acciones legales si continúa difundiendo información falsa sobre nuestra empresa. El inconveniente reportado corresponde a un caso fortuito y no a negligencia de nuestra parte.",
];

export function ArbitrationModule({ analysis, onNext }: Props) {
  const [companyResponse, setCompanyResponse] = useState<CompanyResponse | null>(null);
  const [customResponse, setCustomResponse] = useState("");

  const loadExample = () => {
    setCompanyResponse("custom");
    const idx = Math.floor(Math.random() * SAMPLE_COMPANY_RESPONSES.length);
    setCustomResponse(SAMPLE_COMPANY_RESPONSES[idx]);
  };
  const [showVerdict, setShowVerdict] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState<VerdictData | null>(null);

  const moneda = analysis.pais_detectado === "MX" ? "MXN" : "ARS";

  const canSubmit =
    companyResponse !== null &&
    (companyResponse !== "custom" || customResponse.trim().length >= 15);

  const handleSubmit = () => {
    if (!companyResponse) return;
    setLoading(true);
    // Simulate AI deliberation delay
    setTimeout(() => {
      const result = buildVerdict(companyResponse, customResponse, analysis, moneda);
      setVerdict(result);
      setLoading(false);
      setShowVerdict(true);
    }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-purple-50 p-2">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800">
              Arbitraje Asistido por IA
            </h3>
            <p className="text-sm text-slate-500">
              Nuestra IA actúa como mediadora imparcial evaluando ambas posiciones.
            </p>
          </div>
          {!showVerdict && (
            <button
              type="button"
              onClick={loadExample}
              className="flex shrink-0 items-center gap-1.5 rounded-md bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-600 transition-colors hover:bg-purple-100"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Cargar ejemplo
            </button>
          )}
        </div>

        {!showVerdict ? (
          <div className="space-y-4">
            {/* Consumer position summary */}
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase text-blue-600">
                Posición del Consumidor
              </p>
              <p className="text-sm text-blue-800">{analysis.core_grievance}</p>
              <p className="mt-1 text-xs text-blue-600">
                Monto reclamado: {moneda} ${analysis.monto_reclamo.toLocaleString()}
              </p>
            </div>

            {/* Company response */}
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                Respuesta de la empresa ({analysis.empresa}):
              </p>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50">
                  <input
                    type="radio"
                    name="response"
                    checked={companyResponse === "no_response"}
                    onChange={() => setCompanyResponse("no_response")}
                    className="text-blue-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Sin respuesta</p>
                    <p className="text-xs text-slate-400">
                      La empresa no respondió al reclamo en el plazo establecido.
                    </p>
                  </div>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50">
                  <input
                    type="radio"
                    name="response"
                    checked={companyResponse === "partial"}
                    onChange={() => setCompanyResponse("partial")}
                    className="text-blue-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Respuesta parcial / insatisfactoria
                    </p>
                    <p className="text-xs text-slate-400">
                      Ofrecieron una solución que no cubre el reclamo completo.
                    </p>
                  </div>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50">
                  <input
                    type="radio"
                    name="response"
                    checked={companyResponse === "custom"}
                    onChange={() => setCompanyResponse("custom")}
                    className="text-blue-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Ingresar respuesta de la empresa
                    </p>
                  </div>
                </label>
              </div>

              <AnimatePresence>
                {companyResponse === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    <textarea
                      value={customResponse}
                      onChange={(e) => setCustomResponse(e.target.value)}
                      placeholder="Pegá aquí la respuesta que recibiste de la empresa..."
                      className="h-24 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hint when custom selected but text is empty */}
            {companyResponse === "custom" && customResponse.trim().length < 15 && (
              <p className="text-xs text-amber-600">
                ✏️ Pegá al menos 15 caracteres de la respuesta de la empresa para continuar.
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 font-medium text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                  />
                  Evaluando posiciones...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4" />
                  Solicitar Evaluación Imparcial
                </>
              )}
            </button>
          </div>
        ) : verdict ? (
          <VerdictPanel
            verdict={verdict}
            legalBasis={analysis.analisis_legal}
            onNext={onNext}
          />
        ) : null}
      </div>
    </motion.div>
  );
}

// ── Verdict panel ──────────────────────────────────────────────────────────

const colorMap = {
  emerald: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    title: "text-emerald-800",
    body: "text-emerald-700",
    inner: "bg-emerald-100",
    innerText: "text-emerald-800",
    icon: "text-emerald-600",
  },
  amber: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    title: "text-amber-800",
    body: "text-amber-700",
    inner: "bg-amber-100",
    innerText: "text-amber-800",
    icon: "text-amber-600",
  },
  red: {
    border: "border-red-200",
    bg: "bg-red-50",
    title: "text-red-800",
    body: "text-red-700",
    inner: "bg-red-100",
    innerText: "text-red-800",
    icon: "text-red-600",
  },
};

function VerdictIcon({ icon, className }: { icon: VerdictData["icon"]; className: string }) {
  if (icon === "check") return <CheckCircle className={`h-5 w-5 ${className}`} />;
  if (icon === "minus") return <MinusCircle className={`h-5 w-5 ${className}`} />;
  return <XCircle className={`h-5 w-5 ${className}`} />;
}

function VerdictPanel({
  verdict,
  legalBasis,
  onNext,
}: {
  verdict: VerdictData;
  legalBasis: string;
  onNext: () => void;
}) {
  const c = colorMap[verdict.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Main verdict card */}
      <div className={`rounded-xl border-2 ${c.border} ${c.bg} p-5`}>
        <div className="mb-3 flex items-center gap-2">
          <VerdictIcon icon={verdict.icon} className={c.icon} />
          <h4 className={`font-bold ${c.title}`}>{verdict.title}</h4>
        </div>
        <p className={`text-sm leading-relaxed ${c.body}`}>{verdict.summary}</p>

        {/* Company quote (only for custom responses) */}
        {verdict.companyQuote && (
          <blockquote className={`mt-3 rounded-lg border-l-4 ${c.border} bg-white/60 px-4 py-2 italic`}>
            <p className="text-xs text-slate-500 mb-1 font-semibold uppercase not-italic">
              Respuesta analizada
            </p>
            <p className={`text-xs ${c.body}`}>&ldquo;{verdict.companyQuote}&rdquo;</p>
          </blockquote>
        )}

        <div className={`mt-3 rounded-lg ${c.inner} p-3`}>
          <p className={`text-sm font-medium ${c.innerText}`}>
            Se recomienda: {verdict.recommendation}
          </p>
        </div>
      </div>

      {/* Legal basis */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="mb-1 text-xs font-semibold uppercase text-slate-500">
          Fundamento Legal
        </p>
        <p className="text-sm text-slate-600">{legalBasis}</p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-xs text-amber-700">
          Esta evaluación es orientativa y no vinculante. Para mayor efectividad,
          podés presentarla ante el organismo de defensa del consumidor de tu
          jurisdicción.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-sm font-medium text-white shadow-md transition-shadow hover:shadow-lg"
      >
        Ver seguimiento de mi caso &rarr;
      </button>
    </motion.div>
  );
}
