"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  User,
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
  MessageSquare,
  Send,
  Loader2,
  ChevronDown,
  HandshakeIcon,
  HelpCircle,
} from "lucide-react";
import type { ThreadMessage, CompanyResponseView, ConsumerResponseView } from "@/lib/supabase";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

// ── Merge and sort messages ───────────────────────────────────────────────────

function buildThread(
  companyResponses: ReadonlyArray<CompanyResponseView>,
  consumerResponses: ReadonlyArray<ConsumerResponseView>
): ThreadMessage[] {
  const empresa: ThreadMessage[] = companyResponses.map((r) => ({
    ...r,
    sender: "empresa" as const,
  }));
  const consumidor: ThreadMessage[] = consumerResponses.map((r) => ({
    ...r,
    sender: "consumidor" as const,
  }));
  return [...empresa, ...consumidor].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

// ── Label helpers ─────────────────────────────────────────────────────────────

const EMPRESA_TIPO_LABEL: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  aceptar: {
    label: "Acepta el reclamo",
    color: "text-emerald-400",
    icon: <CheckCircle2 size={14} />,
  },
  propuesta: {
    label: "Propuesta de resolución",
    color: "text-blue-400",
    icon: <HandshakeIcon size={14} />,
  },
  solicitar_info: {
    label: "Solicita más información",
    color: "text-amber-400",
    icon: <HelpCircle size={14} />,
  },
  rechazar: {
    label: "Rechaza el reclamo",
    color: "text-red-400",
    icon: <XCircle size={14} />,
  },
};

const CONSUMER_TIPO_LABEL: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  aceptar: {
    label: "Acepta la propuesta",
    color: "text-emerald-400",
    icon: <CheckCircle2 size={14} />,
  },
  rechazar: {
    label: "Rechaza la propuesta",
    color: "text-red-400",
    icon: <XCircle size={14} />,
  },
  contraofertar: {
    label: "Contraoferta",
    color: "text-indigo-400",
    icon: <ArrowLeftRight size={14} />,
  },
  mensaje: {
    label: "Mensaje",
    color: "text-slate-400",
    icon: <MessageSquare size={14} />,
  },
};

// ── Message bubble ────────────────────────────────────────────────────────────

function Bubble({ msg, index }: { readonly msg: ThreadMessage; readonly index: number }) {
  const isEmpresa = msg.sender === "empresa";

  if (isEmpresa) {
    const emp = msg as CompanyResponseView & { sender: "empresa" };
    const meta = EMPRESA_TIPO_LABEL[emp.tipo_respuesta] ?? EMPRESA_TIPO_LABEL.rechazar;

    return (
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04 }}
        className="flex gap-3 max-w-[85%]"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0 mt-1">
          <Building2 size={14} className="text-slate-400" />
        </div>

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Empresa</span>
            <span className={`flex items-center gap-1 text-[11px] font-semibold ${meta.color}`}>
              {meta.icon}
              {meta.label}
            </span>
            <span className="text-[10px] text-slate-600 ml-auto">{formatDate(emp.created_at)}</span>
          </div>

          {/* Bubble */}
          <div className="bg-[#1e293b] border border-slate-700 rounded-xl rounded-tl-sm p-4">
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {emp.mensaje}
            </p>
            {emp.propuesta_monto !== null && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                <HandshakeIcon size={14} className="text-emerald-400 shrink-0" />
                <span className="text-sm font-semibold text-emerald-400">
                  Propuesta: {formatMoney(emp.propuesta_monto)}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Consumer message
  const con = msg as ConsumerResponseView & { sender: "consumidor" };
  const meta = CONSUMER_TIPO_LABEL[con.tipo_respuesta] ?? CONSUMER_TIPO_LABEL.mensaje;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex gap-3 max-w-[85%] ml-auto flex-row-reverse"
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-1">
        <User size={14} className="text-indigo-400" />
      </div>

      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1.5 flex-row-reverse">
          <span className="text-[11px] font-semibold text-slate-400">Vos</span>
          <span className={`flex items-center gap-1 text-[11px] font-semibold ${meta.color}`}>
            {meta.icon}
            {meta.label}
          </span>
          <span className="text-[10px] text-slate-600 mr-auto">{formatDate(con.created_at)}</span>
        </div>

        {/* Bubble */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl rounded-tr-sm p-4">
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {con.mensaje}
          </p>
          {con.monto_contraoferta !== null && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-2">
              <ArrowLeftRight size={14} className="text-indigo-400 shrink-0" />
              <span className="text-sm font-semibold text-indigo-400">
                Tu contraoferta: {formatMoney(con.monto_contraoferta)}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Reply form ────────────────────────────────────────────────────────────────

type ReplyType = "aceptar" | "rechazar" | "contraofertar" | "mensaje";

const REPLY_OPTIONS: Array<{
  value: ReplyType;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}> = [
  {
    value: "aceptar",
    label: "Aceptar propuesta",
    icon: <CheckCircle2 size={15} />,
    color: "text-emerald-400",
    bg: "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15",
  },
  {
    value: "rechazar",
    label: "Rechazar",
    icon: <XCircle size={15} />,
    color: "text-red-400",
    bg: "border-red-500/30 bg-red-500/10 hover:bg-red-500/15",
  },
  {
    value: "contraofertar",
    label: "Contraofertar",
    icon: <ArrowLeftRight size={15} />,
    color: "text-indigo-400",
    bg: "border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/15",
  },
  {
    value: "mensaje",
    label: "Enviar mensaje",
    icon: <MessageSquare size={15} />,
    color: "text-slate-400",
    bg: "border-slate-600 bg-slate-800/50 hover:bg-slate-800",
  },
];

interface ReplyFormProps {
  readonly caseId: string;
  readonly onSent: (reply: ConsumerResponseView) => void;
  readonly hasProposal: boolean; // whether empresa sent a 'propuesta'
  readonly disabled?: boolean;
}

function ReplyForm({ caseId, onSent, hasProposal, disabled }: ReplyFormProps) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<ReplyType>("mensaje");
  const [mensaje, setMensaje] = useState("");
  const [monto, setMonto] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus textarea when type changes
  useEffect(() => {
    if (open) textRef.current?.focus();
  }, [open, tipo]);

  const selectedOption = REPLY_OPTIONS.find((o) => o.value === tipo)!;

  const handleSend = async () => {
    if (!mensaje.trim() || sending) return;
    setSending(true);
    setError(null);

    try {
      const body: Record<string, unknown> = { case_id: caseId, tipo_respuesta: tipo, mensaje };
      if (tipo === "contraofertar" && monto) {
        body.monto_contraoferta = Number(monto.replace(/\D/g, ""));
      }

      const res = await fetch("/api/cases/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al enviar.");
      }

      const reply: ConsumerResponseView = await res.json();
      onSent(reply);
      setMensaje("");
      setMonto("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setSending(false);
    }
  };

  if (disabled) return null;

  return (
    <div className="mt-6 border-t border-slate-800 pt-5">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
        >
          <MessageSquare size={15} />
          Responder a la empresa
          <ChevronDown size={14} className="ml-auto" />
        </button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {REPLY_OPTIONS.filter((o) =>
                // Only show aceptar/rechazar/contraofertar if empresa sent a proposal
                hasProposal || o.value === "mensaje"
                  ? true
                  : o.value !== "aceptar" && o.value !== "rechazar"
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTipo(opt.value)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${opt.color} ${opt.bg} ${
                    tipo === opt.value ? "ring-2 ring-offset-1 ring-offset-[#0f172a] ring-current" : ""
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Counteroferta amount */}
            {tipo === "contraofertar" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Monto de tu contraoferta
                </label>
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="Ej: 15000"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            )}

            {/* Message input */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                {tipo === "aceptar"
                  ? "Confirmación (opcional)"
                  : tipo === "rechazar"
                    ? "Motivo del rechazo"
                    : "Tu mensaje"}
              </label>
              <textarea
                ref={textRef}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder={
                  tipo === "aceptar"
                    ? "Acepto la propuesta de resolución..."
                    : tipo === "rechazar"
                      ? "Rechazo la propuesta porque..."
                      : tipo === "contraofertar"
                        ? "Mi contraoferta es por el siguiente motivo..."
                        : "Escribí tu mensaje aquí..."
                }
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => { setOpen(false); setError(null); }}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={!mensaje.trim() || sending}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all disabled:opacity-50 ${selectedOption.color} ${selectedOption.bg} border ${selectedOption.bg.split(" ")[0]}`}
              >
                {sending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                {sending ? "Enviando..." : `Enviar ${selectedOption.label.toLowerCase()}`}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface MessageThreadProps {
  readonly caseId: string;
  readonly companyResponses: ReadonlyArray<CompanyResponseView>;
  readonly consumerResponses: ReadonlyArray<ConsumerResponseView>;
  readonly caseStatus: string;
  readonly onReplySubmitted?: (reply: ConsumerResponseView) => void;
}

export function MessageThread({
  caseId,
  companyResponses,
  consumerResponses,
  caseStatus,
  onReplySubmitted,
}: MessageThreadProps) {
  const [localConsumer, setLocalConsumer] = useState<ConsumerResponseView[]>([
    ...consumerResponses,
  ]);

  const thread = buildThread(companyResponses, localConsumer);
  const hasProposal = companyResponses.some((r) => r.tipo_respuesta === "propuesta");
  const isResolved = caseStatus === "resuelto";
  const canReply = companyResponses.length > 0 && !isResolved;

  const handleSent = (reply: ConsumerResponseView) => {
    setLocalConsumer((prev) => [...prev, reply]);
    onReplySubmitted?.(reply);
  };

  if (thread.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
          <MessageSquare size={20} className="text-slate-600" />
        </div>
        <p className="text-sm text-slate-500">
          Aún no hay respuestas de la empresa.
        </p>
        <p className="text-xs text-slate-600 mt-1">
          Una vez que la empresa responda, podrás ver la conversación aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Messages */}
      {thread.map((msg, i) => (
        <Bubble key={msg.id} msg={msg} index={i} />
      ))}

      {/* Resolved badge */}
      {isResolved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3"
        >
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-400">
            Caso resuelto
          </span>
        </motion.div>
      )}

      {/* Reply form */}
      <ReplyForm
        caseId={caseId}
        onSent={handleSent}
        hasProposal={hasProposal}
        disabled={!canReply}
      />
    </div>
  );
}
