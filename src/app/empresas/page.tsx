"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Building2,
  Scale,
  Shield,
  BarChart3,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Activity,
  Users,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import {
  getLevelLabel,
  getScoreBgColor,
  getScoreRingColor,
} from "@/lib/reputation-score";
import type { EmpresaRanking } from "@/app/api/empresas/route";

// ── Fetcher ───────────────────────────────────────────────────────────────────

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Error al cargar empresas");
    return r.json();
  });

function buildUrl(pais: string, search: string): string {
  const params = new URLSearchParams({ pais, limit: "30" });
  if (search.trim()) params.set("search", search.trim());
  return `/api/empresas?${params.toString()}`;
}

// ── Score badge ───────────────────────────────────────────────────────────────

function ScoreBadge({
  score,
  level,
}: {
  score: number;
  level: string;
}) {
  const bg = getScoreBgColor(level as Parameters<typeof getScoreBgColor>[0]);
  const label = getLevelLabel(level as Parameters<typeof getLevelLabel>[0]);
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
      >
        {score.toFixed(1)}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
    </div>
  );
}

// ── Dimension bar ─────────────────────────────────────────────────────────────

function DimBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value / 10) * 100);
  const color =
    value >= 7
      ? "bg-emerald-500"
      : value >= 5
        ? "bg-amber-500"
        : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 text-xs text-slate-400 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span className="w-6 text-xs text-slate-400 text-right">{value}</span>
    </div>
  );
}

// ── Company card ──────────────────────────────────────────────────────────────

function EmpresaCard({
  empresa,
  index,
}: {
  empresa: EmpresaRanking;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const totalQuejas =
    empresa.total_casos_plataforma + (empresa.total_quejas_oficiales ?? 0);
  const ring = empresa.reputation
    ? getScoreRingColor(
        empresa.reputation.level as Parameters<typeof getScoreRingColor>[0]
      )
    : "ring-slate-700";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-[#1e293b] border border-slate-700/60 rounded-2xl overflow-hidden ring-1 ${ring}`}
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-5 flex items-center gap-5 hover:bg-slate-800/40 transition-colors text-left"
      >
        {/* Rank */}
        <span className="text-2xl font-bold text-slate-600 w-8 shrink-0">
          {index + 1}
        </span>

        {/* Company icon */}
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <Building2 size={18} className="text-indigo-400" />
        </div>

        {/* Name + sector */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{empresa.empresa}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {empresa.sector ?? "Sin sector"} ·{" "}
            <span className="font-medium text-slate-400">{empresa.pais}</span>
          </p>
        </div>

        {/* Quick stats */}
        <div className="hidden sm:flex items-center gap-6 mr-4">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{totalQuejas.toLocaleString("es")}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Quejas</p>
          </div>
          {empresa.tasa_resolucion !== null && (
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {(empresa.tasa_resolucion * 100).toFixed(0)}%
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Resolución</p>
            </div>
          )}
        </div>

        {/* Score */}
        {empresa.reputation ? (
          <ScoreBadge
            score={empresa.reputation.score}
            level={empresa.reputation.level}
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-slate-500 text-xs">
            N/D
          </div>
        )}

        <ChevronRight
          size={16}
          className={`text-slate-500 transition-transform shrink-0 ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-700/60 pt-4 space-y-4">
              {/* Veredicto */}
              {empresa.reputation?.veredicto && (
                <p className="text-sm text-slate-400 leading-relaxed">
                  {empresa.reputation.veredicto}
                </p>
              )}

              {/* Dimension bars */}
              {empresa.reputation && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Dimensiones del Score
                  </p>
                  <DimBar
                    label="Resolución"
                    value={empresa.reputation.dimensions.resolucion}
                  />
                  <DimBar
                    label="Recuperación"
                    value={empresa.reputation.dimensions.recuperacion}
                  />
                  <DimBar
                    label="Volumen"
                    value={empresa.reputation.dimensions.volumen}
                  />
                  <DimBar
                    label="Resultado"
                    value={empresa.reputation.dimensions.resultado}
                  />
                </div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <StatChip
                  label="En plataforma"
                  value={empresa.total_casos_plataforma.toString()}
                  icon={<Activity size={12} />}
                />
                {empresa.total_quejas_oficiales !== null && (
                  <StatChip
                    label="Quejas oficiales"
                    value={empresa.total_quejas_oficiales.toLocaleString("es")}
                    icon={<Users size={12} />}
                  />
                )}
                {empresa.probabilidad_exito_promedio !== null && (
                  <StatChip
                    label="Éxito esperado"
                    value={`${(empresa.probabilidad_exito_promedio * 100).toFixed(0)}%`}
                    icon={<TrendingUp size={12} />}
                  />
                )}
                {empresa.monto_reclamo_promedio !== null && (
                  <StatChip
                    label="Monto promedio"
                    value={`$${empresa.monto_reclamo_promedio.toLocaleString("es")}`}
                    icon={<BarChart3 size={12} />}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatChip({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-slate-800/60 rounded-lg p-3">
      <div className="flex items-center gap-1 text-slate-500 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-[#1e293b] border border-slate-700/60 rounded-2xl p-5 flex items-center gap-5 animate-pulse">
      <div className="w-8 h-6 bg-slate-700 rounded" />
      <div className="w-10 h-10 rounded-xl bg-slate-700 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-700 rounded w-40" />
        <div className="h-3 bg-slate-700/60 rounded w-24" />
      </div>
      <div className="w-14 h-14 rounded-full bg-slate-700" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type PaisFilter = "both" | "AR" | "MX";

export default function ExploradorEmpresas() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pais, setPais] = useState<PaisFilter>("both");

  // Debounce search input by 400 ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const url = buildUrl(pais, debouncedSearch);
  const { data, error, isLoading } = useSWR<{ empresas: EmpresaRanking[]; total: number }>(
    url,
    fetcher,
    { keepPreviousData: true }
  );

  const empresas = data?.empresas ?? [];

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value);
    },
    []
  );

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-300 font-sans">
      {/* Sidebar */}
      <div className="w-20 bg-[#1e293b] border-r border-slate-800 flex flex-col items-center py-6 justify-between shrink-0">
        <Link
          href="/"
          className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"
          title="Volver al inicio"
        >
          <Scale size={20} />
        </Link>
        <nav className="flex flex-col gap-8">
          <Link
            href="/"
            className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Inicio"
          >
            <Shield size={22} />
          </Link>
          <div className="p-3 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <Building2 size={22} />
          </div>
          <Link
            href="/mis-casos"
            className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Mis casos"
          >
            <BarChart3 size={22} />
          </Link>
        </nav>
        <Link
          href="/"
          className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          title="Volver"
        >
          <ArrowLeft size={22} />
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-10 border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur-md sticky top-0 z-10">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-indigo-400 tracking-widest uppercase">
              Base Global
            </h2>
            <h1 className="text-2xl text-white font-light">
              Índice de Reputación Corporativa
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* Live indicator */}
            <div className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              {isLoading ? "Actualizando..." : `${empresas.length} empresas`}
            </div>
          </div>
        </header>

        <main className="p-8 max-w-4xl mx-auto">
          {/* Search + filter row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl group-focus-within:bg-indigo-500/20 transition-all rounded-2xl pointer-events-none" />
              <div className="relative bg-[#1e293b] border border-slate-700 focus-within:border-indigo-500 rounded-2xl flex items-center px-5 py-3.5 shadow-xl transition-all">
                <Search className="text-indigo-400 mr-3 shrink-0" size={20} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Buscar empresa (ej. Aeromexico, Telcel, Fravega)…"
                  className="bg-transparent w-full outline-none text-base text-white placeholder-slate-500"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="text-slate-500 hover:text-white text-xs ml-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Country toggle */}
            <div className="flex bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden">
              {(["both", "AR", "MX"] as PaisFilter[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPais(p)}
                  className={`px-5 py-3.5 text-sm font-medium transition-colors ${
                    pais === p
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {p === "both" ? "Todos" : p}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400">
              <AlertTriangle size={18} />
              <span className="text-sm">
                No se pudo cargar el ranking. Intenta de nuevo.
              </span>
            </div>
          )}

          <div className="space-y-3">
            {isLoading && empresas.length === 0
              ? Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : empresas.map((e, i) => (
                  <EmpresaCard key={`${e.empresa}::${e.pais}`} empresa={e} index={i} />
                ))}

            {!isLoading && !error && empresas.length === 0 && (
              <div className="text-center py-20">
                <Building2 size={48} className="text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500">
                  {debouncedSearch
                    ? `No se encontraron empresas para "${debouncedSearch}"`
                    : "No hay datos de empresas disponibles aún."}
                </p>
                {debouncedSearch && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="mt-4 text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer note */}
          {empresas.length > 0 && (
            <p className="text-center text-xs text-slate-600 mt-8">
              Datos combinados de PROFECO, Defensa del Consumidor y casos en plataforma.
              Scores calculados con el algoritmo JustIA — actualizado cada 5 minutos.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
