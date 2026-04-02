"use client";

import { useState } from "react";
import { CaseAnalysis } from "@/lib/types";
import { Users, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  readonly analysis: CaseAnalysis;
  readonly onNext: () => void;
}

type CompanyResponse = "no_response" | "partial" | "custom";

export function ArbitrationModule({ analysis, onNext }: Props) {
  const [companyResponse, setCompanyResponse] = useState<CompanyResponse | null>(null);
  const [customResponse, setCustomResponse] = useState("");
  const [showVerdict, setShowVerdict] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    // Simulate AI deliberation
    setTimeout(() => {
      setLoading(false);
      setShowVerdict(true);
    }, 2500);
  };

  const moneda = analysis.pais_detectado === "MX" ? "MXN" : "ARS";

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
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Arbitraje Asistido por IA
            </h3>
            <p className="text-sm text-slate-500">
              Nuestra IA actúa como mediadora imparcial evaluando ambas posiciones.
            </p>
          </div>
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

            <button
              onClick={handleSubmit}
              disabled={!companyResponse || loading}
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
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Verdict */}
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <h4 className="font-bold text-emerald-800">
                  Recomendación del Árbitro IA
                </h4>
              </div>
              <p className="text-sm leading-relaxed text-emerald-700">
                Tras evaluar las posiciones de ambas partes, la evidencia{" "}
                <strong>favorece al consumidor</strong>. El incumplimiento de{" "}
                {analysis.empresa} respecto a {analysis.producto_servicio} está
                respaldado por la normativa vigente.
              </p>
              <div className="mt-3 rounded-lg bg-emerald-100 p-3">
                <p className="text-sm font-medium text-emerald-800">
                  Se recomienda:{" "}
                  {analysis.probabilidad_exito > 0.7
                    ? "Cambio del producto o devolución íntegra del importe abonado, más compensación por daños."
                    : "Reparación del producto o compensación parcial equivalente al daño demostrado."}
                </p>
              </div>
            </div>

            {/* Legal basis */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase text-slate-500">
                Fundamento Legal
              </p>
              <p className="text-sm text-slate-600">{analysis.analisis_legal}</p>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-700">
                Esta evaluación es orientativa y no vinculante. Para mayor
                efectividad, podés presentarla ante el organismo de defensa del
                consumidor de tu jurisdicción.
              </p>
            </div>

            <button
              onClick={onNext}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-sm font-medium text-white shadow-md transition-shadow hover:shadow-lg"
            >
              Ver seguimiento de mi caso &rarr;
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
