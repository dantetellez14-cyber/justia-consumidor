"use client";

import { Scale, Info, ArrowLeft } from "lucide-react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { NotificationBell } from "@/components/notification-bell";
import { type AppStep, STEP_LABELS, STEP_ORDER } from "@/hooks/useComplaintFlow";

interface AppHeaderProps {
  step: AppStep;
  completedSteps: Set<AppStep>;
  onBack: () => void;
  onRestart: () => void;
  onOpenFormula: () => void;
}

export function AppHeader({ step, completedSteps, onBack, onRestart, onOpenFormula }: AppHeaderProps) {
  const { isSignedIn } = useAuth();
  const currentStepIndex = STEP_ORDER.indexOf(step);

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            title="Paso anterior"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={onRestart}
            className="flex items-center gap-2.5 rounded-lg p-1 transition-colors hover:bg-slate-100"
            title="Ir al inicio"
          >
            <div className="rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-2">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold text-slate-800 leading-tight">
                JustIA Consumidor
              </h1>
              <p className="text-xs text-slate-400">{STEP_LABELS[step]}</p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 sm:flex">
            {STEP_ORDER.slice(1).map((s, i) => (
              <div
                key={s}
                className={`h-2 w-2 rounded-full transition-colors ${
                  s === step
                    ? "bg-blue-500 ring-4 ring-blue-100"
                    : completedSteps.has(s)
                      ? "bg-emerald-400"
                      : i < currentStepIndex - 1
                        ? "bg-emerald-400"
                        : "bg-slate-200"
                }`}
                title={STEP_LABELS[s]}
              />
            ))}
          </div>

          {currentStepIndex >= 2 && (
            <button
              onClick={onRestart}
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 sm:flex"
              title="Comenzar un nuevo reclamo"
            >
              <Scale className="h-4 w-4" />
              Nuevo caso
            </button>
          )}

          <button
            onClick={onOpenFormula}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">Fórmula E</span>
          </button>

          {isSignedIn && (
            <>
              <a
                href="/mis-casos"
                className="hidden items-center rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 sm:flex"
              >
                Mis casos
              </a>
              <NotificationBell />
              <UserButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
