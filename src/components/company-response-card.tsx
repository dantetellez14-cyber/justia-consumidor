"use client";

import type { CompanyResponseView } from "@/lib/supabase";
import {
  CheckCircle2,
  XCircle,
  HandCoins,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";

const RESPONSE_CONFIG: Record<
  CompanyResponseView["tipo_respuesta"],
  {
    label: string;
    icon: typeof CheckCircle2;
    badgeColor: string;
    borderColor: string;
    bgColor: string;
  }
> = {
  aceptar: {
    label: "Reclamo aceptado",
    icon: CheckCircle2,
    badgeColor: "bg-emerald-100 text-emerald-700",
    borderColor: "border-emerald-200",
    bgColor: "bg-emerald-50",
  },
  rechazar: {
    label: "Reclamo rechazado",
    icon: XCircle,
    badgeColor: "bg-red-100 text-red-700",
    borderColor: "border-red-200",
    bgColor: "bg-red-50",
  },
  propuesta: {
    label: "Propuesta de resolucion",
    icon: HandCoins,
    badgeColor: "bg-blue-100 text-blue-700",
    borderColor: "border-blue-200",
    bgColor: "bg-blue-50",
  },
  solicitar_info: {
    label: "Solicitud de informacion",
    icon: HelpCircle,
    badgeColor: "bg-amber-100 text-amber-700",
    borderColor: "border-amber-200",
    bgColor: "bg-amber-50",
  },
};

interface Props {
  readonly response: CompanyResponseView;
  readonly pais: "AR" | "MX" | null;
  readonly index?: number;
}

function formatResponseDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number, country: string | null): string {
  const currency = country === "MX" ? "MXN" : "ARS";
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CompanyResponseCard({ response, pais, index = 0 }: Props) {
  const config = RESPONSE_CONFIG[response.tipo_respuesta];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`rounded-xl border ${config.borderColor} ${config.bgColor} p-4`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.badgeColor}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {config.label}
        </span>
        <span className="text-xs text-slate-400">
          {formatResponseDate(response.created_at)}
        </span>
      </div>

      <div className="flex items-start gap-2">
        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <p className="text-sm leading-relaxed text-slate-700">
          {response.mensaje}
        </p>
      </div>

      {response.propuesta_monto != null && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/80 px-3 py-1.5">
          <HandCoins className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">
            Monto propuesto: {formatCurrency(response.propuesta_monto, pais)}
          </span>
        </div>
      )}
    </motion.div>
  );
}

/** Small badge for case list cards indicating response count. */
export function ResponseIndicator({
  count,
  latestType,
}: {
  readonly count: number;
  readonly latestType: CompanyResponseView["tipo_respuesta"];
}) {
  const config = RESPONSE_CONFIG[latestType];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.badgeColor}`}
    >
      <Icon className="h-3 w-3" />
      {count === 1 ? "1 respuesta" : `${count} respuestas`}
    </span>
  );
}
