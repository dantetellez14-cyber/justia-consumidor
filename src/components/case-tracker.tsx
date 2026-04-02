"use client";

import { CaseAnalysis } from "@/lib/types";
import {
  CheckCircle,
  Clock,
  Send,
  Scale,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  readonly analysis: CaseAnalysis;
  readonly hasComplaint: boolean;
  readonly hasArbitration: boolean;
  readonly onFinish: () => void;
}

interface TimelineStep {
  label: string;
  description: string;
  status: "completed" | "current" | "pending";
  icon: typeof CheckCircle;
  date?: string;
}

export function CaseTracker({
  analysis,
  hasComplaint,
  hasArbitration,
  onFinish,
}: Props) {
  const today = new Date().toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const steps: TimelineStep[] = [
    {
      label: "Consulta recibida",
      description: "Tu caso fue analizado por la IA.",
      status: "completed",
      icon: CheckCircle,
      date: today,
    },
    {
      label: "Reclamo generado",
      description: hasComplaint
        ? "Nota formal de reclamo creada y lista para enviar."
        : "Pendiente de generar reclamo formal.",
      status: hasComplaint ? "completed" : "pending",
      icon: Send,
      date: hasComplaint ? today : undefined,
    },
    {
      label: "Enviado a la empresa",
      description: "Esperando respuesta de " + analysis.empresa + ".",
      status: hasComplaint ? "current" : "pending",
      icon: Clock,
    },
    {
      label: "Mediación IA",
      description: hasArbitration
        ? "Evaluación arbitral completada."
        : "Disponible si la empresa no responde en 10 días.",
      status: hasArbitration ? "completed" : "pending",
      icon: Scale,
      date: hasArbitration ? today : undefined,
    },
    {
      label: "Resolución",
      description: "Caso resuelto satisfactoriamente.",
      status: "pending",
      icon: CheckCircle,
    },
  ];

  const defensaUrl =
    analysis.pais_detectado === "MX"
      ? "https://www.gob.mx/profeco"
      : "https://www.argentina.gob.ar/produccion/defensadelconsumidor";

  const defensaLabel =
    analysis.pais_detectado === "MX"
      ? "PROFECO (Procuraduría Federal del Consumidor)"
      : "Defensa del Consumidor (Argentina)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Seguimiento del Caso
            </h3>
            <p className="text-sm text-slate-500">
              {analysis.empresa} &mdash; {analysis.producto_servicio}
            </p>
          </div>
          <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            En proceso
          </div>
        </div>

        {/* Timeline */}
        <div className="relative space-y-0">
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative flex gap-4 pb-6"
              >
                {/* Vertical line */}
                {!isLast && (
                  <div
                    className={`absolute left-[19px] top-10 h-full w-0.5 ${
                      step.status === "completed"
                        ? "bg-emerald-300"
                        : "bg-slate-200"
                    }`}
                  />
                )}

                {/* Icon */}
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    step.status === "completed"
                      ? "bg-emerald-100"
                      : step.status === "current"
                        ? "bg-blue-100 ring-4 ring-blue-50"
                        : "bg-slate-100"
                  }`}
                >
                  <step.icon
                    className={`h-5 w-5 ${
                      step.status === "completed"
                        ? "text-emerald-600"
                        : step.status === "current"
                          ? "text-blue-600"
                          : "text-slate-400"
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm font-semibold ${
                        step.status === "pending"
                          ? "text-slate-400"
                          : "text-slate-800"
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.date && (
                      <span className="text-xs text-slate-400">{step.date}</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Escalation option */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-amber-200 bg-amber-50 p-5"
      >
        <h4 className="mb-2 text-sm font-semibold text-amber-800">
          Escalar a organismo oficial
        </h4>
        <p className="mb-3 text-xs text-amber-700">
          Si tu reclamo no fue resuelto, podés presentar una denuncia formal ante:
        </p>
        <a
          href={defensaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-200"
        >
          <ExternalLink className="h-4 w-4" />
          {defensaLabel}
        </a>
      </motion.div>

      {/* Next action */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="mb-1 text-xs font-semibold uppercase text-slate-400">
          Próximo paso sugerido
        </p>
        <p className="text-sm text-slate-600">
          {hasArbitration
            ? "Presentar la evaluación arbitral ante el organismo de defensa del consumidor para respaldar tu reclamo."
            : hasComplaint
              ? "Enviar el reclamo formal a la empresa y esperar respuesta durante 10 días hábiles."
              : "Generar y enviar tu reclamo formal a la empresa."}
        </p>
      </div>

      <button
        onClick={onFinish}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-sm font-medium text-white shadow-md transition-shadow hover:shadow-lg"
      >
        Finalizar y dar feedback
        <ArrowRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
