"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Scale, Info, ArrowLeft } from "lucide-react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { CaseAnalysis, FinancialMetrics } from "@/lib/types";
import { JurisprudenciaCase } from "@/lib/types";
import { calculateFinancialMetrics } from "@/lib/scoring";
import { fetchCasesByCountry } from "@/lib/jurisprudencia";
import { WelcomeHero } from "@/components/welcome-hero";
import { ComplaintForm } from "@/components/complaint-form";
import type { ComplaintFormData } from "@/components/complaint-form";
import { ExtractedEntities } from "@/components/extracted-entities";
import { FinancialChart } from "@/components/financial-chart";
import { RecommendationAlert } from "@/components/recommendation-alert";
import { JurisprudenciaList } from "@/components/jurisprudencia-list";
import { FormulaModal } from "@/components/formula-modal";
import { FooterMetrics } from "@/components/footer-metrics";
import { LoadingAnimation } from "@/components/loading-animation";
import { ComplaintGenerator } from "@/components/complaint-generator";
import { ArbitrationModule } from "@/components/arbitration-module";
import { EscalationModule } from "@/components/escalation-module";
import { CaseTracker } from "@/components/case-tracker";
import { ComplaintStatsPanel } from "@/components/complaint-stats-panel";
import { FeedbackRating } from "@/components/feedback-rating";
import { NotificationBell } from "@/components/notification-bell";
import { posthog } from "@/lib/posthog";

type AppStep =
  | "welcome"
  | "analyze"
  | "results"
  | "complaint"
  | "arbitration"
  | "escalation"
  | "tracking"
  | "feedback";

const STEP_LABELS: Record<AppStep, string> = {
  welcome: "Inicio",
  analyze: "Consulta",
  results: "Análisis",
  complaint: "Reclamo",
  arbitration: "Mediación",
  escalation: "Escalamiento",
  tracking: "Seguimiento",
  feedback: "Feedback",
};

const STEP_ORDER: AppStep[] = [
  "welcome",
  "analyze",
  "results",
  "complaint",
  "arbitration",
  "escalation",
  "tracking",
  "feedback",
];

async function saveCase(relato: string, analysis: CaseAnalysis): Promise<string | null> {
  try {
    const res = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relato, ...analysis }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.id;
    }
  } catch {
    // Non-blocking: continue even if save fails
  }
  return null;
}

async function updateCase(caseId: string, updates: Record<string, unknown>): Promise<void> {
  try {
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  } catch {
    // Non-blocking
  }
}

export default function Home() {
  const [step, setStep] = useState<AppStep>("welcome");
  const [relato, setRelato] = useState("");
  const [analysis, setAnalysis] = useState<CaseAnalysis | null>(null);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [relevantCases, setRelevantCases] = useState<
    ReadonlyArray<JurisprudenciaCase>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<AppStep>>(
    new Set()
  );
  const [caseId, setCaseId] = useState<string | null>(null);
  const { isSignedIn } = useAuth();

  const markCompleted = (s: AppStep) => {
    setCompletedSteps((prev) => new Set([...prev, s]));
  };

  const handleAnalyze = useCallback(
    async (composedRelato: string, submittedForm: ComplaintFormData) => {
      if (!composedRelato.trim()) return;

      setRelato(composedRelato);
      setLoading(true);
      setError(null);
      setAnalysis(null);
      setMetrics(null);
      setRelevantCases([]);

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ relato: composedRelato }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error al analizar el caso.");
        }

        const data: CaseAnalysis = await res.json();

        // Override AI-extracted fields with user-provided structured data
        const enrichedAnalysis: CaseAnalysis = {
          ...data,
          empresa: submittedForm.empresa || data.empresa,
          producto_servicio: submittedForm.producto || data.producto_servicio,
          ...(submittedForm.monto
            ? { monto_reclamo: Number(submittedForm.monto) }
            : {}),
          ...(submittedForm.fechaCompra
            ? { fecha_incidente: submittedForm.fechaCompra }
            : {}),
          pais_detectado:
            submittedForm.moneda === "MXN" ? "MX" : data.pais_detectado,
        };

        setAnalysis(enrichedAnalysis);
        setMetrics(calculateFinancialMetrics(enrichedAnalysis));

        // Try Pinecone semantic search, fallback to static list
        // Note: analisis_legal excluded — legal citations add noise to semantic embeddings
        const searchQuery = `${enrichedAnalysis.empresa} ${enrichedAnalysis.producto_servicio} ${enrichedAnalysis.core_grievance}`;
        try {
          const searchRes = await fetch("/api/search-jurisprudencia", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: searchQuery,
              pais: enrichedAnalysis.pais_detectado,
            }),
          });
          const searchData = await searchRes.json();
          if (searchData.cases && searchData.cases.length > 0) {
            setRelevantCases(searchData.cases);
          } else {
            setRelevantCases(
              await fetchCasesByCountry(enrichedAnalysis.pais_detectado)
            );
          }
        } catch {
          setRelevantCases(
            await fetchCasesByCountry(enrichedAnalysis.pais_detectado)
          );
        }

        markCompleted("analyze");

        // PostHog: case analyzed
        posthog.capture("case_analyzed", {
          empresa: enrichedAnalysis.empresa,
          pais: enrichedAnalysis.pais_detectado,
          categoria: enrichedAnalysis.producto_servicio,
          probabilidad_exito: enrichedAnalysis.probabilidad_exito,
          monto_reclamo: enrichedAnalysis.monto_reclamo,
          casos_encontrados: relevantCases.length,
        });

        // Save to Supabase
        const savedId = await saveCase(composedRelato, enrichedAnalysis);
        if (savedId) {
          setCaseId(savedId);
        }

        setStep("results");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleRestart = () => {
    setStep("welcome");
    setRelato("");
    setAnalysis(null);
    setMetrics(null);
    setRelevantCases([]);
    setError(null);
    setCompletedSteps(new Set());
    setCaseId(null);
  };

  const currency = analysis?.pais_detectado === "MX" ? "MXN" : "ARS";
  const currentStepIndex = STEP_ORDER.indexOf(step);

  // Welcome screen
  if (step === "welcome") {
    return <WelcomeHero onStart={() => setStep("analyze")} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (currentStepIndex > 1) {
                  setStep(STEP_ORDER[currentStepIndex - 1]);
                } else {
                  setStep("welcome");
                }
              }}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              title="Paso anterior"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            {/* Logo — click goes directly to welcome/home */}
            <button
              onClick={handleRestart}
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
                <p className="text-xs text-slate-400">
                  {STEP_LABELS[step]}
                </p>
              </div>
            </button>
          </div>
          <div className="flex items-center gap-3">
            {/* Step indicators */}
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
            {/* Nuevo caso — only shown after at least one analysis */}
            {currentStepIndex >= 2 && (
              <button
                onClick={handleRestart}
                className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 sm:flex"
                title="Comenzar un nuevo reclamo"
              >
                <Scale className="h-4 w-4" />
                Nuevo caso
              </button>
            )}
            <button
              onClick={() => setModalOpen(true)}
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

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {/* STEP: Analyze (structured form) */}
        {step === "analyze" && (
          <div>
            <ComplaintForm
              onSubmit={handleAnalyze}
              loading={loading}
              error={error}
            />
            {loading && (
              <div className="mt-8">
                <LoadingAnimation />
              </div>
            )}
          </div>
        )}

        {/* STEP: Results (dashboard) */}
        {step === "results" && analysis && metrics && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            {/* Left Panel */}
            <div className="lg:col-span-2">
              <ExtractedEntities analysis={analysis} />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Análisis Legal
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {analysis.analisis_legal}
                </p>
              </motion.div>

              {/* Complaint Statistics from PROFECO / Defensa del Consumidor */}
              <div className="mt-4">
                <ComplaintStatsPanel
                  empresa={analysis.empresa}
                  sector={analysis.producto_servicio}
                  pais={analysis.pais_detectado}
                />
              </div>
            </div>

            {/* Right Panel */}
            <div className="space-y-6 lg:col-span-3">
              <RecommendationAlert metrics={metrics} currency={currency} />
              <FinancialChart metrics={metrics} currency={currency} />
              <JurisprudenciaList cases={relevantCases} />

              {/* Action buttons */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    markCompleted("results");
                    setStep("complaint");
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-medium text-white shadow-md transition-shadow hover:shadow-lg"
                >
                  Generar mi reclamo formal
                </button>
                <button
                  onClick={() => {
                    markCompleted("results");
                    setStep("tracking");
                  }}
                  className="flex flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Ver mis opciones
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP: Complaint Generator */}
        {step === "complaint" && analysis && (
          <div className="mx-auto max-w-3xl">
            <ComplaintGenerator
              analysis={analysis}
              caseId={caseId}
              onNext={() => {
                markCompleted("complaint");
                posthog.capture("complaint_generated", {
                  empresa: analysis.empresa,
                  pais: analysis.pais_detectado,
                  monto_reclamo: analysis.monto_reclamo,
                });
                if (caseId) {
                  updateCase(caseId, {
                    complaint_generated: true,
                    status: "reclamo_generado",
                  });
                }
                setStep("arbitration");
              }}
            />
          </div>
        )}

        {/* STEP: Arbitration */}
        {step === "arbitration" && analysis && (
          <div className="mx-auto max-w-2xl">
            <ArbitrationModule
              analysis={analysis}
              onNext={() => {
                markCompleted("arbitration");
                posthog.capture("arbitration_completed", {
                  empresa: analysis.empresa,
                  pais: analysis.pais_detectado,
                });
                if (caseId) {
                  updateCase(caseId, {
                    arbitration_completed: true,
                    status: "en_mediacion",
                  });
                }
                setStep("tracking");
              }}
            />
          </div>
        )}

        {/* STEP: Escalation to PROFECO/COPREC */}
        {step === "escalation" && analysis && (
          <div className="mx-auto max-w-2xl">
            <EscalationModule
              analysis={analysis}
              caseId={caseId}
              onNext={() => {
                markCompleted("escalation");
                posthog.capture("case_escalated", {
                  empresa: analysis.empresa,
                  pais: analysis.pais_detectado,
                  monto_reclamo: analysis.monto_reclamo,
                  via_arbitraje: completedSteps.has("arbitration"),
                });
                if (caseId) {
                  updateCase(caseId, {
                    status: "escalado",
                  });
                }
                setStep("tracking");
              }}
            />
          </div>
        )}

        {/* STEP: Case Tracking */}
        {step === "tracking" && analysis && (
          <div className="mx-auto max-w-2xl">
            <CaseTracker
              analysis={analysis}
              hasComplaint={completedSteps.has("complaint")}
              hasArbitration={completedSteps.has("arbitration")}
              hasEscalation={completedSteps.has("escalation")}
              onEscalate={() => setStep("escalation")}
              onFinish={() => {
                markCompleted("tracking");
                posthog.capture("case_completed", {
                  empresa: analysis.empresa,
                  pais: analysis.pais_detectado,
                  steps_completed: [...completedSteps],
                });
                setStep("feedback");
              }}
            />
          </div>
        )}

        {/* STEP: Feedback */}
        {step === "feedback" && (
          <div className="py-8">
            <FeedbackRating caseId={caseId} onRestart={handleRestart} />
          </div>
        )}
      </main>

      {step !== "feedback" && <FooterMetrics />}
      <FormulaModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
