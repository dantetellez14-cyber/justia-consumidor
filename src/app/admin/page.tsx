"use client";

import { useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Scale,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Globe,
  Building2,
  Star,
  DollarSign,
  FileText,
  Landmark,
  RefreshCw,
} from "lucide-react";
import { fetcher } from "@/lib/swr";
import type { AdminMetrics } from "@/app/api/admin/metrics/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString("es-AR");
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Ahora mismo";
  if (mins < 60) return `Hace ${mins}min`;
  return `Hace ${Math.floor(mins / 60)}h`;
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  delay = 0,
}: {
  readonly label: string;
  readonly value: string | number;
  readonly sub?: string;
  readonly icon: React.ElementType;
  readonly color: string;
  readonly delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl bg-[#1e293b] border border-slate-800 p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon size={14} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </motion.div>
  );
}

// ── Mini bar chart ────────────────────────────────────────────────────────────

function MiniBarChart({
  data,
  height = 60,
}: {
  readonly data: ReadonlyArray<{ date: string; count: number }>;
  readonly height?: number;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div
      className="flex items-end gap-0.5 w-full"
      style={{ height }}
    >
      {data.map((d, i) => {
        const pct = (d.count / max) * 100;
        const isToday = d.date === new Date().toISOString().slice(0, 10);
        return (
          <div
            key={d.date}
            className="flex-1 group relative"
            style={{ height: "100%" }}
          >
            <div
              className={`absolute bottom-0 w-full rounded-sm transition-all group-hover:opacity-80 ${
                isToday ? "bg-indigo-400" : "bg-slate-600"
              }`}
              style={{ height: `${Math.max(pct, 2)}%` }}
              title={`${d.date}: ${d.count} casos`}
            />
            {/* Tooltip on hover */}
            {i % 7 === 6 && (
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-slate-600 hidden group-hover:block whitespace-nowrap">
                {d.date.slice(5)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  consulta_recibida: "bg-blue-500/20 text-blue-400",
  reclamo_generado: "bg-amber-500/20 text-amber-400",
  enviado_empresa: "bg-red-500/20 text-red-400",
  en_mediacion: "bg-purple-500/20 text-purple-400",
  escalado: "bg-orange-500/20 text-orange-400",
  resuelto: "bg-emerald-500/20 text-emerald-400",
};

const STATUS_LABELS: Record<string, string> = {
  consulta_recibida: "Consulta",
  reclamo_generado: "Reclamo",
  enviado_empresa: "Enviado",
  en_mediacion: "Mediación",
  escalado: "Escalado",
  resuelto: "Resuelto",
};

function StatusBar({
  item,
  total,
}: {
  readonly item: { status: string; count: number };
  readonly total: number;
}) {
  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
  const color = STATUS_COLORS[item.status] ?? "bg-slate-500/20 text-slate-400";
  const label = STATUS_LABELS[item.status] ?? item.status;

  return (
    <div className="flex items-center gap-3">
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${color}`}
      >
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full bg-indigo-500 rounded-full"
        />
      </div>
      <div className="flex items-center gap-1.5 shrink-0 w-20 justify-end">
        <span className="text-xs font-semibold text-white">{fmt(item.count)}</span>
        <span className="text-[10px] text-slate-500">{pct}%</span>
      </div>
    </div>
  );
}

// ── Star rating bar ───────────────────────────────────────────────────────────

function RatingBar({
  rating,
  count,
  total,
}: {
  readonly rating: number;
  readonly count: number;
  readonly total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 w-4">{rating}</span>
      <Star size={10} className="text-amber-400 shrink-0" />
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full bg-amber-400 rounded-full"
        />
      </div>
      <span className="text-[10px] text-slate-500 w-8 text-right">{count}</span>
    </div>
  );
}

// ── Donut (simple CSS) ────────────────────────────────────────────────────────

function CountryDonut({
  data,
}: {
  readonly data: ReadonlyArray<{ pais: string; count: number }>;
}) {
  const total = data.reduce((a, b) => a + b.count, 0);
  const ar = data.find((d) => d.pais === "AR")?.count ?? 0;
  const mx = data.find((d) => d.pais === "MX")?.count ?? 0;
  const arPct = total > 0 ? Math.round((ar / total) * 100) : 50;

  return (
    <div className="flex items-center gap-4">
      {/* SVG donut */}
      <svg width={64} height={64} viewBox="0 0 64 64" className="shrink-0">
        <circle cx={32} cy={32} r={24} fill="none" strokeWidth={12} stroke="#1e3a5f" />
        {/* AR arc */}
        <circle
          cx={32}
          cy={32}
          r={24}
          fill="none"
          strokeWidth={12}
          stroke="#6366f1"
          strokeDasharray={`${(arPct / 100) * 150.8} 150.8`}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
        />
        <text x={32} y={36} textAnchor="middle" fontSize={12} fontWeight="bold" fill="white">
          {arPct}%
        </text>
      </svg>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-400" />
          <span className="text-xs text-slate-300">Argentina</span>
          <span className="text-xs font-semibold text-white ml-auto">{fmt(ar)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-600" />
          <span className="text-xs text-slate-300">México</span>
          <span className="text-xs font-semibold text-white ml-auto">{fmt(mx)}</span>
        </div>
        {data.filter((d) => d.pais !== "AR" && d.pais !== "MX").map((d) => (
          <div key={d.pais} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-700" />
            <span className="text-xs text-slate-400">{d.pais}</span>
            <span className="text-xs text-slate-500 ml-auto">{fmt(d.count)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { isSignedIn, isLoaded, userId } = useAuth();

  const {
    data: metrics,
    error,
    isLoading,
    mutate,
  } = useSWR<AdminMetrics>(
    isLoaded && isSignedIn ? "/api/admin/metrics" : null,
    fetcher,
    {
      refreshInterval: 120_000, // auto-refresh every 2 min
      revalidateOnFocus: true,
    }
  );

  const totalByStatus = useMemo(
    () => metrics?.by_status.reduce((acc, s) => acc + s.count, 0) ?? 0,
    [metrics]
  );

  const totalFeedback = useMemo(
    () => metrics?.feedback.total_responses ?? 0,
    [metrics]
  );

  // ── Auth guards ──

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] text-slate-300 gap-6">
        <AlertTriangle size={48} className="text-amber-500" />
        <p className="text-lg font-medium text-white">Acceso restringido</p>
        <Link
          href="/"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Ir al inicio
        </Link>
      </div>
    );
  }

  if (error?.status === 403 || (error && !metrics)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] text-slate-300 gap-4">
        <AlertTriangle size={48} className="text-red-500" />
        <p className="text-lg font-medium text-white">Acceso denegado</p>
        <p className="text-sm text-slate-400">No tenés permisos para ver esta página.</p>
        <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300">
          ← Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-16 bg-[#1e293b] border-r border-slate-800 flex flex-col items-center py-6 justify-between z-20">
        <Link
          href="/"
          className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"
        >
          <Scale size={20} />
        </Link>
        <div className="space-y-4">
          <div className="p-3 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <BarChart3 size={20} />
          </div>
        </div>
        <Link
          href="/"
          className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          title="Inicio"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>

      {/* Main */}
      <div className="ml-16">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <BarChart3 size={18} className="text-indigo-400" />
            <h1 className="text-white font-semibold">Panel de Monitoreo</h1>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-full px-2 py-0.5 font-semibold uppercase tracking-wider">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            {metrics && (
              <span className="text-xs text-slate-600">
                Actualizado {timeAgo(metrics.generated_at)}
              </span>
            )}
            <button
              onClick={() => mutate()}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
              Actualizar
            </button>
          </div>
        </header>

        <main className="px-8 py-8 max-w-7xl mx-auto">
          {/* Loading skeleton */}
          {isLoading && !metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          )}

          {metrics && (
            <>
              {/* ── KPI strip ── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                  label="Total casos"
                  value={fmt(metrics.totals.cases)}
                  sub={`+${fmt(metrics.totals.cases30d)} últimos 30 días`}
                  icon={FileText}
                  color="bg-indigo-500/20 text-indigo-400"
                  delay={0}
                />
                <StatCard
                  label="Resueltos"
                  value={`${metrics.resolution_rate}%`}
                  sub={`${fmt(metrics.totals.resolved)} de ${fmt(metrics.totals.cases)}`}
                  icon={CheckCircle2}
                  color="bg-emerald-500/20 text-emerald-400"
                  delay={0.05}
                />
                <StatCard
                  label="Escalados"
                  value={fmt(metrics.totals.escalated)}
                  sub="Llevados a organismos"
                  icon={Landmark}
                  color="bg-amber-500/20 text-amber-400"
                  delay={0.1}
                />
                <StatCard
                  label="Reclamos generados"
                  value={fmt(metrics.totals.complaints_generated)}
                  sub="Documentos formales"
                  icon={FileText}
                  color="bg-purple-500/20 text-purple-400"
                  delay={0.15}
                />
                <StatCard
                  label="Reclamo promedio"
                  value={fmtMoney(metrics.financial.avg_claim)}
                  sub={`Total reclamado: ${fmtMoney(metrics.financial.total_claimed)}`}
                  icon={DollarSign}
                  color="bg-cyan-500/20 text-cyan-400"
                  delay={0.2}
                />
                <StatCard
                  label="Score de éxito (avg)"
                  value={`${metrics.financial.avg_success_score}%`}
                  sub="Probabilidad media"
                  icon={TrendingUp}
                  color="bg-rose-500/20 text-rose-400"
                  delay={0.25}
                />
                <StatCard
                  label="Rating promedio"
                  value={`${metrics.feedback.avg_rating} / 5`}
                  sub={`${fmt(totalFeedback)} evaluaciones`}
                  icon={Star}
                  color="bg-amber-500/20 text-amber-400"
                  delay={0.3}
                />
                <StatCard
                  label="Empresas únicas"
                  value={fmt(metrics.top_companies.length)}
                  sub="En el top 10"
                  icon={Building2}
                  color="bg-indigo-500/20 text-indigo-400"
                  delay={0.35}
                />
              </div>

              {/* ── Charts row ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Daily volume */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="lg:col-span-2 rounded-xl bg-[#1e293b] border border-slate-800 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-semibold text-white">
                        Volumen diario
                      </h2>
                      <p className="text-xs text-slate-500">Últimos 30 días</p>
                    </div>
                    <TrendingUp size={16} className="text-indigo-400" />
                  </div>
                  <MiniBarChart data={metrics.daily_volume} height={80} />
                  <div className="flex justify-between mt-3 text-[10px] text-slate-600">
                    <span>{metrics.daily_volume[0]?.date.slice(5) ?? ""}</span>
                    <span>Hoy</span>
                  </div>
                </motion.div>

                {/* Country distribution */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="rounded-xl bg-[#1e293b] border border-slate-800 p-6"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-sm font-semibold text-white">Por país</h2>
                      <p className="text-xs text-slate-500">Distribución geográfica</p>
                    </div>
                    <Globe size={16} className="text-indigo-400" />
                  </div>
                  <CountryDonut data={metrics.by_country} />
                </motion.div>
              </div>

              {/* ── Bottom row ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status breakdown */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-xl bg-[#1e293b] border border-slate-800 p-6"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-sm font-semibold text-white">Por estado</h2>
                      <p className="text-xs text-slate-500">Distribución del pipeline</p>
                    </div>
                    <Users size={16} className="text-indigo-400" />
                  </div>
                  <div className="space-y-3">
                    {metrics.by_status.map((item) => (
                      <StatusBar key={item.status} item={item} total={totalByStatus} />
                    ))}
                  </div>
                </motion.div>

                {/* Top companies */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="rounded-xl bg-[#1e293b] border border-slate-800 p-6"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-sm font-semibold text-white">
                        Top empresas reclamadas
                      </h2>
                      <p className="text-xs text-slate-500">Por volumen de casos</p>
                    </div>
                    <Building2 size={16} className="text-indigo-400" />
                  </div>
                  <div className="space-y-2">
                    {metrics.top_companies.slice(0, 8).map((c, i) => {
                      const resPct = c.count > 0 ? Math.round((c.resolved / c.count) * 100) : 0;
                      return (
                        <div key={c.empresa} className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-600 w-4 shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-xs text-slate-300 flex-1 truncate" title={c.empresa}>
                            {c.empresa}
                          </span>
                          <span className="text-xs font-semibold text-white shrink-0 w-6 text-right">
                            {c.count}
                          </span>
                          <span
                            className={`text-[10px] font-semibold shrink-0 w-10 text-right ${
                              resPct >= 50
                                ? "text-emerald-400"
                                : resPct >= 25
                                  ? "text-amber-400"
                                  : "text-red-400"
                            }`}
                          >
                            {resPct}%✓
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Feedback */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="rounded-xl bg-[#1e293b] border border-slate-800 p-6"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-sm font-semibold text-white">Satisfacción</h2>
                      <p className="text-xs text-slate-500">Feedback de usuarios</p>
                    </div>
                    <Star size={16} className="text-amber-400" />
                  </div>

                  {/* Big rating */}
                  <div className="flex items-end gap-2 mb-5">
                    <span className="text-4xl font-bold text-white">
                      {metrics.feedback.avg_rating.toFixed(1)}
                    </span>
                    <div className="pb-1">
                      <div className="flex gap-0.5 mb-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i < Math.round(metrics.feedback.avg_rating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-700"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {fmt(totalFeedback)} respuestas
                      </p>
                    </div>
                  </div>

                  {/* Distribution */}
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((r) => {
                      const item = metrics.feedback.distribution.find(
                        (d) => d.rating === r
                      );
                      return (
                        <RatingBar
                          key={r}
                          rating={r}
                          count={item?.count ?? 0}
                          total={totalFeedback}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Footer note */}
              <p className="mt-8 text-center text-xs text-slate-700">
                Datos actualizados automáticamente cada 2 minutos · Generado {new Date(metrics.generated_at).toLocaleString("es-AR")}
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
