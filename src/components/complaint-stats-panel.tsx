"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Building2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import type { ReputationScore } from "@/lib/reputation-score";
import { ReputationScoreBadge } from "./reputation-score-badge";

// ── Types matching the API response ──

interface CompanyStats {
  empresa: string;
  sector: string;
  pais: string;
  total_quejas: number;
  quejas_conciliadas: number;
  quejas_no_conciliadas: number;
  monto_promedio_reclamado: number | null;
  monto_promedio_recuperado: number | null;
  tasa_resolucion: number | null;
  periodo: string;
  fuente: string;
}

interface SectorStats {
  sector: string;
  pais: string;
  total_quejas: number;
  tasa_resolucion_promedio: number | null;
  duracion_promedio_dias: number | null;
  empresa_mas_reclamada: string | null;
  periodo: string;
}

interface ComplaintStatsResult {
  company: CompanyStats | null;
  similarCompanies: CompanyStats[];
  sectorStats: SectorStats | null;
  reputationScore: ReputationScore | null;
}

interface Props {
  readonly empresa: string;
  readonly sector?: string;
  readonly pais: "AR" | "MX";
}

function formatNumber(n: number): string {
  return n.toLocaleString("es");
}

function formatCurrency(n: number, pais: string): string {
  const currency = pais === "MX" ? "MXN" : "ARS";
  return `$${n.toLocaleString("es")} ${currency}`;
}

function formatPercent(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
}

// ── Resolution bar ──

function ResolutionBar({
  conciliadas,
  total,
}: {
  readonly conciliadas: number;
  readonly total: number;
}) {
  const pct = total > 0 ? (conciliadas / total) * 100 : 0;
  return (
    <div className="mt-1">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Tasa de resolución</span>
        <span className="font-semibold text-slate-700">{pct.toFixed(0)}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${
            pct >= 70
              ? "bg-emerald-500"
              : pct >= 50
                ? "bg-amber-500"
                : "bg-red-400"
          }`}
        />
      </div>
    </div>
  );
}

// ── Main Component ──

export function ComplaintStatsPanel({ empresa, sector, pais }: Props) {
  const body = empresa ? { empresa, sector: sector ?? "", pais } : null;

  const { data: stats, error, isLoading: loading } = useSWR<ComplaintStatsResult>(
    body ? ["/api/complaint-stats", body] : null,
    ([url, params]: [string, unknown]) =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }).then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // dedupe identical requests for 60s
    }
  );

  if (loading) {
    return (
      <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 h-4 w-40 rounded bg-slate-100" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="h-3 w-3/4 rounded bg-slate-100" />
          <div className="h-3 w-1/2 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error || !stats) return null;

  const { company, similarCompanies, sectorStats, reputationScore } = stats;
  const hasData = company || sectorStats;

  if (!hasData) return null;

  const fuente = pais === "MX" ? "PROFECO" : "Defensa del Consumidor";
  const fuenteUrl =
    pais === "MX"
      ? "https://datos.profeco.gob.mx"
      : "https://datos.gob.ar";

  return (
    <div className="space-y-4">
      {/* Reputation Score Badge */}
      {reputationScore && (
        <ReputationScoreBadge
          score={reputationScore}
          empresa={company?.empresa ?? empresa}
        />
      )}

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-orange-50 p-1.5">
          <BarChart3 className="h-4 w-4 text-orange-600" />
        </div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Historial de reclamos
        </h3>
      </div>

      {/* Company-specific stats */}
      {company && (
        <div className="mb-4 rounded-lg border border-orange-100 bg-orange-50/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-orange-600" />
            <p className="text-sm font-semibold text-slate-800">
              {company.empresa}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Total complaints */}
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
              <div>
                <p className="text-lg font-bold text-slate-800">
                  {formatNumber(company.total_quejas)}
                </p>
                <p className="text-xs text-slate-500">
                  quejas ({company.periodo})
                </p>
              </div>
            </div>

            {/* Resolved */}
            <div className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <div>
                <p className="text-lg font-bold text-slate-800">
                  {formatNumber(company.quejas_conciliadas)}
                </p>
                <p className="text-xs text-slate-500">resueltas a favor</p>
              </div>
            </div>

            {/* Avg claimed */}
            {company.monto_promedio_reclamado && (
              <div className="flex items-start gap-2">
                <DollarSign className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {formatCurrency(
                      company.monto_promedio_reclamado,
                      company.pais
                    )}
                  </p>
                  <p className="text-xs text-slate-500">monto prom. reclamado</p>
                </div>
              </div>
            )}

            {/* Avg recovered */}
            {company.monto_promedio_recuperado && (
              <div className="flex items-start gap-2">
                <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {formatCurrency(
                      company.monto_promedio_recuperado,
                      company.pais
                    )}
                  </p>
                  <p className="text-xs text-slate-500">monto prom. recuperado</p>
                </div>
              </div>
            )}
          </div>

          <ResolutionBar
            conciliadas={company.quejas_conciliadas}
            total={company.total_quejas}
          />
        </div>
      )}

      {/* Sector stats (when no company match or as supplement) */}
      {sectorStats && (
        <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
            Sector: {sectorStats.sector}
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="font-semibold text-slate-800">
                {formatNumber(sectorStats.total_quejas)}
              </p>
              <p className="text-xs text-slate-500">quejas en el sector</p>
            </div>
            {sectorStats.tasa_resolucion_promedio !== null && (
              <div>
                <p className="font-semibold text-slate-800">
                  {formatPercent(sectorStats.tasa_resolucion_promedio)}
                </p>
                <p className="text-xs text-slate-500">
                  resolución promedio
                </p>
              </div>
            )}
            {sectorStats.duracion_promedio_dias !== null && (
              <div className="flex items-start gap-1.5">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <div>
                  <p className="font-semibold text-slate-800">
                    {sectorStats.duracion_promedio_dias} días
                  </p>
                  <p className="text-xs text-slate-500">duración promedio</p>
                </div>
              </div>
            )}
            {sectorStats.empresa_mas_reclamada && (
              <div>
                <p className="font-semibold text-slate-800">
                  {sectorStats.empresa_mas_reclamada}
                </p>
                <p className="text-xs text-slate-500">más reclamada</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Similar companies in the sector */}
      {similarCompanies.length > 0 && (
        <div className="mb-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Otras empresas del sector
          </p>
          <div className="space-y-1.5">
            {similarCompanies.slice(0, 4).map((c) => (
              <div
                key={c.empresa}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-slate-50"
              >
                <span className="text-slate-700">{c.empresa}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">
                    {formatNumber(c.total_quejas)} quejas
                  </span>
                  {c.tasa_resolucion !== null && (
                    <span
                      className={`font-medium ${
                        c.tasa_resolucion >= 0.7
                          ? "text-emerald-600"
                          : c.tasa_resolucion >= 0.5
                            ? "text-amber-600"
                            : "text-red-500"
                      }`}
                    >
                      {formatPercent(c.tasa_resolucion)}
                      {c.tasa_resolucion >= 0.7 ? (
                        <CheckCircle className="ml-0.5 inline h-3 w-3" />
                      ) : c.tasa_resolucion < 0.5 ? (
                        <XCircle className="ml-0.5 inline h-3 w-3" />
                      ) : null}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source attribution */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <p className="text-[10px] text-slate-400">
          Fuente: {fuente} ({sectorStats?.periodo ?? company?.periodo ?? "2023-2024"})
        </p>
        <a
          href={fuenteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-600"
        >
          Ver datos
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </motion.div>
    </div>
  );
}
