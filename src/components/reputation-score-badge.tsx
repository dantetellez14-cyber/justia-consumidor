"use client";

import { motion } from "framer-motion";
import { Shield, TrendingUp, BarChart3, Target, Award } from "lucide-react";
import type { ReputationScore, ScoreLevel } from "@/lib/reputation-score";
import {
  getScoreBgColor,
  getLevelLabel,
} from "@/lib/reputation-score";

interface Props {
  readonly score: ReputationScore;
  readonly empresa: string;
}

// ── Score circle with animated fill ──

function ScoreCircle({
  score,
  level,
}: {
  readonly score: number;
  readonly level: ScoreLevel;
}) {
  const circumference = 2 * Math.PI * 40;
  const fillPercent = score / 10;
  const strokeDashoffset = circumference * (1 - fillPercent);

  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      {/* Background ring */}
      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-slate-100"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className={getScoreTextColor(level)}
          stroke="currentColor"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      {/* Score number */}
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <span className="text-2xl font-bold text-slate-800">
          {score.toFixed(1)}
        </span>
        <span className="text-[10px] font-medium text-slate-400">/10</span>
      </motion.div>
    </div>
  );
}

function getScoreTextColor(level: ScoreLevel): string {
  switch (level) {
    case "excelente":
      return "text-emerald-500";
    case "bueno":
      return "text-blue-500";
    case "regular":
      return "text-amber-500";
    case "malo":
      return "text-orange-500";
    case "no_recomendado":
      return "text-red-500";
  }
}

// ── Dimension bar ──

function DimensionBar({
  label,
  value,
  icon,
  delay,
}: {
  readonly label: string;
  readonly value: number;
  readonly icon: React.ReactNode;
  readonly delay: number;
}) {
  const pct = (value / 10) * 100;
  const color =
    value >= 7
      ? "bg-emerald-400"
      : value >= 5
        ? "bg-amber-400"
        : "bg-red-400";

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="flex w-24 items-center gap-1.5 text-xs text-slate-500">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="flex-1">
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className={`h-full rounded-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: delay + 0.1, duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
      <span className="w-8 text-right text-xs font-semibold text-slate-600">
        {value.toFixed(1)}
      </span>
    </motion.div>
  );
}

// ── Main Component ──

export function ReputationScoreBadge({ score, empresa }: Props) {
  const bgColor = getScoreBgColor(score.level);
  const levelLabel = getLevelLabel(score.level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-purple-50 p-1.5">
          <Shield className="h-4 w-4 text-purple-600" />
        </div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Reputacion
        </h3>
      </div>

      {/* Score + Level */}
      <div className="mb-4 flex items-center gap-4">
        <ScoreCircle score={score.score} level={score.level} />

        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${bgColor}`}
            >
              <Award className="h-3 w-3" />
              {levelLabel}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-700">{empresa}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Basado en datos de PROFECO / Defensa del Consumidor
          </p>
        </div>
      </div>

      {/* Dimension breakdown */}
      <div className="mb-4 space-y-2.5 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
        <DimensionBar
          label="Resolucion"
          value={score.dimensions.resolucion}
          icon={<Target className="h-3 w-3 shrink-0" />}
          delay={0.4}
        />
        <DimensionBar
          label="Recuperacion"
          value={score.dimensions.recuperacion}
          icon={<TrendingUp className="h-3 w-3 shrink-0" />}
          delay={0.5}
        />
        <DimensionBar
          label="Volumen"
          value={score.dimensions.volumen}
          icon={<BarChart3 className="h-3 w-3 shrink-0" />}
          delay={0.6}
        />
        <DimensionBar
          label="Resultado"
          value={score.dimensions.resultado}
          icon={<Award className="h-3 w-3 shrink-0" />}
          delay={0.7}
        />
      </div>

      {/* Verdict */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className={`rounded-lg border p-3 ${getVerdictStyles(score.level)}`}
      >
        <p className="text-xs leading-relaxed">{score.veredicto}</p>
      </motion.div>
    </motion.div>
  );
}

function getVerdictStyles(level: ScoreLevel): string {
  switch (level) {
    case "excelente":
      return "border-emerald-100 bg-emerald-50/50 text-emerald-700";
    case "bueno":
      return "border-blue-100 bg-blue-50/50 text-blue-700";
    case "regular":
      return "border-amber-100 bg-amber-50/50 text-amber-700";
    case "malo":
      return "border-orange-100 bg-orange-50/50 text-orange-700";
    case "no_recomendado":
      return "border-red-100 bg-red-50/50 text-red-700";
  }
}
