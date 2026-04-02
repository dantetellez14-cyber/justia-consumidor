"use client";

import { FinancialMetrics } from "@/lib/types";
import { Shield, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  readonly metrics: FinancialMetrics;
  readonly currency: string;
}

export function RecommendationAlert({ metrics, currency }: Props) {
  const isSettle = metrics.recomendacion === "SETTLE_NOW";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={`rounded-xl border-2 p-5 ${
        isSettle
          ? "border-emerald-200 bg-emerald-50"
          : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`rounded-full p-2 ${
            isSettle ? "bg-emerald-100" : "bg-amber-100"
          }`}
        >
          {isSettle ? (
            <Shield className="h-6 w-6 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          )}
        </div>
        <div>
          <h3
            className={`text-lg font-bold ${
              isSettle ? "text-emerald-800" : "text-amber-800"
            }`}
          >
            {isSettle
              ? "CONCILIAR AHORA"
              : "DEFENSA SELECTIVA"}
          </h3>
          <p
            className={`text-sm ${
              isSettle ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            {isSettle
              ? `El valor esperado (${currency} $${metrics.valorEsperado.toLocaleString()}) supera el costo de acuerdo (${currency} $${metrics.costoAcuerdo.toLocaleString()}). Conciliar es la opción más eficiente.`
              : `El costo de acuerdo (${currency} $${metrics.costoAcuerdo.toLocaleString()}) supera el valor esperado. Se recomienda evaluar defensa selectiva.`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
