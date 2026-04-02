"use client";

import { JurisprudenciaCase } from "@/lib/types";
import { Scale, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  readonly cases: ReadonlyArray<JurisprudenciaCase>;
}

export function JurisprudenciaList({ cases }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
        Jurisprudencia Relevante
      </h3>
      <div className="space-y-3">
        {cases.map((c, i) => (
          <motion.div
            key={c.expediente_id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="rounded-lg border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-bold text-blue-700">
                  {c.expediente_id}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                {c.duracion_dias} días
              </div>
            </div>
            <p className="mb-1 text-xs text-slate-600">{c.hechos}</p>
            <p className="text-xs font-medium text-slate-700 italic">
              &ldquo;{c.ratio_decidendi}&rdquo;
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${c.probabilidad_exito * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-500">
                {Math.round(c.probabilidad_exito * 100)}% éxito
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
