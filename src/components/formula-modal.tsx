"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function FormulaModal({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Fórmula de Valor Esperado
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1 transition-colors hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-5">
                <p className="text-center font-mono text-lg font-bold text-slate-700">
                  E = P &times; V &minus; (1 &minus; P) &times; C
                </p>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <span className="inline-block w-8 rounded bg-blue-100 px-2 py-1 text-center font-mono font-bold text-blue-700">
                    E
                  </span>
                  <p>
                    <strong>Valor Esperado</strong> &mdash; El resultado financiero
                    proyectado del litigio, considerando probabilidad y costos.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-block w-8 rounded bg-purple-100 px-2 py-1 text-center font-mono font-bold text-purple-700">
                    P
                  </span>
                  <p>
                    <strong>Probabilidad de Éxito</strong> &mdash; Valor entre 0 y 1
                    estimado por la IA basándose en la normativa aplicable y
                    jurisprudencia.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-block w-8 rounded bg-emerald-100 px-2 py-1 text-center font-mono font-bold text-emerald-700">
                    V
                  </span>
                  <p>
                    <strong>Valor del Reclamo</strong> &mdash; Monto total reclamado
                    por el consumidor.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-block w-8 rounded bg-red-100 px-2 py-1 text-center font-mono font-bold text-red-700">
                    C
                  </span>
                  <p>
                    <strong>Costo de Defensa</strong> &mdash; Estimado como el 25% del
                    valor del reclamo (honorarios legales, administrativos, etc.).
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  <strong>Regla de decisión:</strong> Si{" "}
                  <span className="font-mono">E &gt; Costo de Acuerdo</span> (40%
                  del valor reclamado), se recomienda{" "}
                  <strong>conciliar de inmediato</strong>. De lo contrario, se
                  recomienda <strong>defensa selectiva</strong>.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
