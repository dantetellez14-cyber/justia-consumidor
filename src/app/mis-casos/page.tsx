"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Scale,
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  TrendingUp,
} from "lucide-react";
import type { CaseRecord, CaseStatus } from "@/lib/supabase";

const STATUS_CONFIG: Record<
  CaseStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  consulta_recibida: {
    label: "Consulta recibida",
    color: "bg-blue-100 text-blue-700",
    icon: Clock,
  },
  reclamo_generado: {
    label: "Reclamo generado",
    color: "bg-amber-100 text-amber-700",
    icon: FileText,
  },
  enviado_empresa: {
    label: "Enviado a empresa",
    color: "bg-purple-100 text-purple-700",
    icon: Building2,
  },
  en_mediacion: {
    label: "En mediación",
    color: "bg-orange-100 text-orange-700",
    icon: Scale,
  },
  resuelto: {
    label: "Resuelto",
    color: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle2,
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
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

export default function MisCasosPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [cases, setCases] = useState<ReadonlyArray<CaseRecord>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    async function fetchCases() {
      try {
        const res = await fetch("/api/cases");
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error al cargar los casos.");
        }
        const data = await res.json();
        setCases(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar los casos."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCases();
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
        <AlertCircle className="mb-4 h-12 w-12 text-slate-400" />
        <h1 className="text-xl font-bold text-slate-800">
          Iniciá sesión para ver tus casos
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Necesitás una cuenta para acceder al historial de tus reclamos.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <Link
            href="/"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-2">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Mis Casos</h1>
            <p className="text-xs text-slate-400">
              Historial de reclamos
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && cases.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-20 text-center"
          >
            <FileText className="mb-4 h-16 w-16 text-slate-300" />
            <h2 className="text-xl font-bold text-slate-700">
              No tenés casos todavía
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              Cuando analices tu primer reclamo, aparecerá acá para que puedas
              darle seguimiento.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-md"
            >
              Comenzar un reclamo
            </Link>
          </motion.div>
        )}

        {!loading && cases.length > 0 && (
          <div className="space-y-4">
            {cases.map((c, i) => {
              const statusCfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.consulta_recibida;
              const StatusIcon = statusCfg.icon;

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left: case info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          {c.pais_detectado === "MX" ? "Mexico" : "Argentina"}
                        </span>
                      </div>

                      {c.empresa && (
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          {c.empresa}
                        </div>
                      )}

                      {c.core_grievance && (
                        <p className="text-sm text-slate-600">
                          {c.core_grievance}
                        </p>
                      )}

                      <p className="text-xs text-slate-400">
                        {formatDate(c.created_at)}
                      </p>
                    </div>

                    {/* Right: metrics */}
                    <div className="flex items-center gap-6 sm:text-right">
                      {c.monto_reclamo != null && (
                        <div>
                          <p className="text-xs text-slate-400">Monto</p>
                          <p className="text-sm font-semibold text-slate-800">
                            {formatCurrency(c.monto_reclamo, c.pais_detectado)}
                          </p>
                        </div>
                      )}
                      {c.probabilidad_exito != null && (
                        <div>
                          <p className="text-xs text-slate-400">Prob.</p>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                            <p className="text-sm font-semibold text-emerald-600">
                              {Math.round(c.probabilidad_exito * 100)}%
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-slate-400">
            JustIA Consumidor &mdash; Cuando una empresa falla, tus derechos no
            deben fallar contigo.
          </p>
          <div className="flex gap-4">
            <Link href="/privacidad" className="text-xs text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline">
              Privacidad
            </Link>
            <Link href="/terminos" className="text-xs text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline">
              Términos de uso
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
