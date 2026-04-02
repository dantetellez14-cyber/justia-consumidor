"use client";

import { FinancialMetrics } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

interface Props {
  readonly metrics: FinancialMetrics;
  readonly currency: string;
}

const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

export function FinancialChart({ metrics, currency }: Props) {
  const data = [
    { name: "Valor Reclamado", value: metrics.valorReclamado },
    { name: "Valor Esperado (E)", value: metrics.valorEsperado },
    { name: "Costo Acuerdo", value: metrics.costoAcuerdo },
    { name: "Costo Legal", value: metrics.costoLegal },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
        Análisis Financiero
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value) => [
              `${currency} $${Number(value).toLocaleString()}`,
              "",
            ]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "13px",
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={48}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
