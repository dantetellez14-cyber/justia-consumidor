"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Scale,
  ArrowLeft,
  Check,
  Hourglass,
  Bot,
  FileText,
  Building2,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Gavel,
} from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/swr";
import type { CaseWithResponses, CaseStatus, ConsumerResponseView } from "@/lib/supabase";
import { MessageThread } from "@/components/message-thread";

// ── Timeline step config ──────────────────────────────────────────────────────

interface TimelineStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  doneWhen: (c: CaseWithResponses) => boolean;
  activeWhen: (c: CaseWithResponses) => boolean;
}

const STEPS: TimelineStep[] = [
  {
    id: "consulta",
    label: "Consulta registrada",
    description: "Tu caso fue recibido y registrado en el sistema con todos los detalles del reclamo.",
    icon: <FileText size={18} />,
    doneWhen: () => true, // Always done if case exists
    activeWhen: () => false,
  },
  {
    id: "analisis",
    label: "Análisis IA completado",
    description: "JustIA analizó tu caso, calculó la probabilidad de éxito y buscó jurisprudencia similar.",
    icon: <Bot size={18} />,
    doneWhen: () => true, // Always done if case exists
    activeWhen: () => false,
  },
  {
    id: "reclamo",
    label: "Reclamo formal generado",
    description: "Se generó el documento legal de reclamo con las bases jurídicas correspondientes.",
    icon: <FileText size={18} />,
    doneWhen: (c) => c.complaint_generated,
    activeWhen: (c) => !c.complaint_generated,
  },
  {
    id: "empresa",
    label: "Enviado a empresa",
    description: "El reclamo fue enviado a la empresa y está esperando respuesta formal.",
    icon: <Building2 size={18} />,
    doneWhen: (c) =>
      ["enviado_empresa", "en_mediacion", "escalado", "resuelto"].includes(c.status),
    activeWhen: (c) => c.complaint_generated && c.status === "reclamo_generado",
  },
  {
    id: "mediacion",
    label: "Mediación / Arbitraje",
    description: "Proceso de mediación activo. JustIA asiste en las negociaciones con la empresa.",
    icon: <Scale size={18} />,
    doneWhen: (c) => ["escalado", "resuelto"].includes(c.status),
    activeWhen: (c) => c.status === "en_mediacion",
  },
  {
    id: "escalamiento",
    label: "Escalado a organismo",
    description: "El caso fue escalado formalmente a PROFECO (MX) o Defensa del Consumidor (AR).",
    icon: <Gavel size={18} />,
    doneWhen: (c) => c.status === "resuelto",
    activeWhen: (c) => c.status === "escalado",
  },
  {
    id: "resolucion",
    label: "Caso resuelto",
    description: "¡Tu reclamo fue resuelto! Consulta el detalle de la resolución en tus documentos.",
    icon: <CheckCircle2 size={18} />,
    doneWhen: (c) => c.status === "resuelto",
    activeWhen: (c) => c.status === "escalado",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<CaseStatus, string> = {
  consulta_recibida: "Consulta recibida",
  reclamo_generado: "Reclamo generado",
  enviado_empresa: "Enviado a empresa",
  en_mediacion: "En mediación",
  escalado: "Escalado a organismo",
  resuelto: "Resuelto",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number, pais: string | null): string {
  const currency = pais === "MX" ? "MXN" : "ARS";
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Step node component ───────────────────────────────────────────────────────

function StepNode({
  step,
  caseData,
  index,
  isLast,
}: {
  step: TimelineStep;
  caseData: CaseWithResponses;
  index: number;
  isLast: boolean;
}) {
  const done = step.doneWhen(caseData);
  const active = !done && step.activeWhen(caseData);
  const pending = !done && !active;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`relative pl-12 ${!isLast ? "pb-10" : ""} ${pending ? "opacity-40" : ""}`}
    >
      {/* Vertical line */}
      {!isLast && (
        <div
          className={`absolute left-[19px] top-10 w-0.5 h-full -translate-x-px ${
            done ? "bg-emerald-500/40" : "bg-slate-700"
          }`}
        />
      )}

      {/* Node icon */}
      <div
        className={`absolute left-0 top-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
          done
            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
            : active
              ? "bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
              : "bg-[#1e293b] border-slate-700 text-slate-600"
        }`}
      >
        {done ? (
          <Check size={18} className="text-emerald-400" />
        ) : active ? (
          <Hourglass size={18} className="animate-pulse" />
        ) : (
          step.icon
        )}
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-lg font-medium text-white">{step.label}</h3>
          {active && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-medium text-indigo-400 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              En progreso
            </span>
          )}
          {done && step.id !== "consulta" && step.id !== "analisis" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-400 uppercase tracking-wider">
              <Check size={10} />
              Completado
            </span>
          )}
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
        {done && step.id === "consulta" && (
          <p className="text-xs text-slate-600 uppercase tracking-wider mt-2 font-medium">
            {formatDate(caseData.created_at)}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse space-y-10">
      <div className="space-y-3">
        <div className="h-4 bg-slate-700 rounded w-32" />
        <div className="h-8 bg-slate-700 rounded w-64" />
        <div className="h-4 bg-slate-700/60 rounded w-48" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-700 shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-5 bg-slate-700 rounded w-48" />
            <div className="h-4 bg-slate-700/60 rounded w-72" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main content ──────────────────────────────────────────────────────────────

function SeguimientoContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { data: caseData, error, isLoading, mutate } = useSWR<CaseWithResponses>(
    id ? `/api/cases?id=${id}` : null,
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 30000 }
  );

  // Optimistically update status to "resuelto" if consumer accepted
  const handleReplySubmitted = (reply: ConsumerResponseView) => {
    if (reply.tipo_respuesta === "aceptar") {
      void mutate();
    }
  };

  // No ID provided
  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertTriangle size={48} className="text-amber-500 mb-4" />
        <h2 className="text-xl font-medium text-white mb-2">Caso no especificado</h2>
        <p className="text-slate-400 mb-6 max-w-sm">
          Accede al seguimiento desde el flujo de análisis o desde tu lista de casos.
        </p>
        <Link
          href="/mis-casos"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Ver mis casos
        </Link>
      </div>
    );
  }

  // Error or not found
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-medium text-white mb-2">Caso no encontrado</h2>
        <p className="text-slate-400 mb-6">
          No pudimos cargar el caso. Es posible que no te pertenezca o haya sido eliminado.
        </p>
        <Link
          href="/mis-casos"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Ver mis casos
        </Link>
      </div>
    );
  }

  if (isLoading || !caseData) {
    return <Skeleton />;
  }

  const statusLabel = STATUS_LABELS[caseData.status] ?? caseData.status;
  const pct = caseData.probabilidad_exito !== null
    ? Math.round(caseData.probabilidad_exito * 100)
    : null;

  return (
    <div className="flex gap-12">
      {/* Left column — timeline */}
      <div className="flex-1 min-w-0">
        {/* Case header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Caso #{caseData.id.slice(0, 8).toUpperCase()}
          </div>
          <h2 className="text-3xl font-light text-white mb-2">
            Seguimiento de Caso
          </h2>
          <p className="text-slate-400">
            {caseData.empresa ?? "Empresa no especificada"} ·{" "}
            {caseData.producto_servicio ?? "Producto/servicio no especificado"}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-full px-4 py-1.5 text-xs font-medium text-slate-300">
            <Clock size={12} className="text-slate-500" />
            {statusLabel}
          </div>
        </div>

        {/* Steps */}
        <div className="relative border-l-2 border-slate-800 ml-5">
          {STEPS.map((step, i) => (
            <StepNode
              key={step.id}
              step={step}
              caseData={caseData}
              index={i}
              isLast={i === STEPS.length - 1}
            />
          ))}
        </div>

        {/* Message thread — empresa + consumer replies */}
        <div className="mt-10 border-t border-slate-800 pt-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-5">
            Conversación con la empresa
          </h3>
          <MessageThread
            caseId={caseData.id}
            companyResponses={caseData.company_responses ?? []}
            consumerResponses={caseData.consumer_responses ?? []}
            caseStatus={caseData.status}
            onReplySubmitted={handleReplySubmitted}
          />
        </div>
      </div>

      {/* Right column — metrics */}
      <div className="w-[340px] shrink-0 flex flex-col gap-5">
        {/* Win probability */}
        {pct !== null && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1e293b] border border-slate-800 rounded-xl p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-white font-medium text-sm">Probabilidad de éxito</h4>
                <p className="text-xs text-slate-500 mt-0.5">Calculada por IA</p>
              </div>
              <div
                className={`text-3xl font-light ${
                  pct >= 70
                    ? "text-emerald-400"
                    : pct >= 50
                      ? "text-amber-400"
                      : "text-red-400"
                }`}
              >
                {pct}%
              </div>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
              <motion.div
                className={`h-full rounded-full ${
                  pct >= 70 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-400" : "bg-red-400"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Empresa</span>
                <span className="text-white font-medium truncate max-w-[140px]">
                  {caseData.empresa ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">País</span>
                <span className="text-white font-medium">
                  {caseData.pais_detectado ?? "—"}
                </span>
              </div>
              {caseData.monto_reclamo !== null && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Monto reclamado</span>
                  <span className="text-white font-medium">
                    {formatCurrency(caseData.monto_reclamo, caseData.pais_detectado)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Timeline summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-[#1e293b] border border-slate-800 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-indigo-400" />
            <h4 className="text-white font-medium text-sm">Progreso del caso</h4>
          </div>
          <div className="space-y-2">
            {STEPS.map((step) => {
              const done = step.doneWhen(caseData);
              const active = !done && step.activeWhen(caseData);
              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      done
                        ? "bg-emerald-500"
                        : active
                          ? "bg-indigo-500 animate-pulse"
                          : "bg-slate-700"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      done ? "text-slate-400" : active ? "text-white" : "text-slate-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Monto card */}
        {caseData.monto_reclamo !== null && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#1e293b] border border-slate-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Hourglass size={16} className="text-slate-400" />
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Monto en disputa
              </h4>
            </div>
            <div className="text-4xl font-light text-white mt-2">
              {formatCurrency(caseData.monto_reclamo, caseData.pais_detectado)}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Registrado el {formatDate(caseData.created_at)}
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link
            href="/mis-casos"
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <ArrowLeft size={14} />
            Volver a mis casos
          </Link>
          {caseData.complaint_generated && (
            <Link
              href={`/mis-casos/editor?id=${caseData.id}`}
              className="flex items-center justify-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <FileText size={14} />
              Ver documento de reclamo
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page wrapper (Suspense required for useSearchParams) ──────────────────────

export default function SeguimientoPage() {
  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-300 font-sans">
      {/* Sidebar */}
      <div className="w-20 bg-[#1e293b] border-r border-slate-800 flex flex-col items-center py-6 justify-between shrink-0">
        <Link
          href="/"
          className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"
        >
          <Scale size={20} />
        </Link>
        <Link
          href="/mis-casos"
          className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          title="Mis casos"
        >
          <ArrowLeft size={22} />
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="h-16 border-b border-slate-800 flex items-center px-8 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-10">
          <Link
            href="/mis-casos"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Mis casos
          </Link>
          <span className="mx-3 text-slate-700">/</span>
          <span className="text-slate-300 text-sm">Seguimiento</span>
        </header>

        <main className="p-8 max-w-6xl mx-auto">
          <Suspense fallback={<Skeleton />}>
            <SeguimientoContent />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
