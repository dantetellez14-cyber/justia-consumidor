"use client";

import { TrendingDown, Handshake, Clock } from "lucide-react";
import { motion } from "framer-motion";

const metrics = [
  {
    icon: TrendingDown,
    label: "Reducción de Fricción Legal",
    value: "73%",
    description: "Menos tiempo en disputas",
  },
  {
    icon: Handshake,
    label: "Tasa de Conciliación",
    value: "89%",
    description: "Casos resueltos sin litigio",
  },
  {
    icon: Clock,
    label: "Tiempo Promedio de Resolución",
    value: "4.2 días",
    description: "Desde consulta hasta acuerdo",
  },
];

export function FooterMetrics() {
  return (
    <footer className="border-t border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="rounded-lg bg-blue-50 p-2.5">
                <m.icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{m.label}</p>
                <p className="text-xl font-bold text-slate-800">{m.value}</p>
                <p className="text-xs text-slate-500">{m.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <p className="text-xs text-slate-400">
            JustIA Consumidor &mdash; Democratizando el acceso a la justicia con
            inteligencia artificial
          </p>
        </div>
      </div>
    </footer>
  );
}
