"use client";

import { CaseAnalysis } from "@/lib/types";
import {
  Building2,
  Package,
  DollarSign,
  Calendar,
  AlertTriangle,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  readonly analysis: CaseAnalysis;
}

const entityItems = [
  { key: "empresa", label: "Empresa", icon: Building2 },
  { key: "producto_servicio", label: "Producto/Servicio", icon: Package },
  { key: "monto_reclamo", label: "Monto Reclamado", icon: DollarSign },
  { key: "fecha_incidente", label: "Fecha Incidente", icon: Calendar },
  { key: "core_grievance", label: "Agravio Principal", icon: AlertTriangle },
  { key: "pais_detectado", label: "País", icon: Globe },
] as const;

export function ExtractedEntities({ analysis }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
        Entidades Extraídas
      </h3>
      <div className="space-y-3">
        {entityItems.map(({ key, label, icon: Icon }, i) => {
          const value = analysis[key as keyof CaseAnalysis];
          const displayValue =
            key === "monto_reclamo"
              ? `${analysis.pais_detectado === "MX" ? "MXN" : "ARS"} $${Number(value).toLocaleString()}`
              : key === "pais_detectado"
                ? value === "AR"
                  ? "Argentina"
                  : "México"
                : String(value);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3"
            >
              <div className="mt-0.5 rounded-lg bg-blue-50 p-2">
                <Icon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-800">
                  {displayValue}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 rounded-lg bg-slate-50 p-3"
      >
        <p className="text-xs font-medium text-slate-400">
          Probabilidad de Éxito
        </p>
        <div className="mt-1 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${analysis.probabilidad_exito * 100}%`,
              }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
            />
          </div>
          <span className="text-sm font-bold text-slate-700">
            {Math.round(analysis.probabilidad_exito * 100)}%
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
