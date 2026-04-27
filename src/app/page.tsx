"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { useComplaintFlow, STEP_ORDER } from "@/hooks/useComplaintFlow";
import { AppHeader } from "@/components/app-header";
import { LoginPromptModal } from "@/components/login-prompt-modal";
import { WelcomeHero } from "@/components/welcome-hero";
import { ComplaintForm } from "@/components/complaint-form";
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
import { posthog } from "@/lib/posthog";

export default function Home() {
  const flow = useComplaintFlow();
  const { isSignedIn } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { step, setStep, analysis, metrics, relevantCases, loading, error,
    completedSteps, caseId, markCompleted, handleAnalyze, handleRestart, updateCase } = flow;

  const currency = analysis?.pais_detectado === "MX" ? "MXN" : "ARS";
  const currentStepIndex = STEP_ORDER.indexOf(step);

  if (step === "welcome") {
    return <WelcomeHero onStart={() => setStep("analyze")} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader
        step={step}
        completedSteps={completedSteps}
        onBack={() => {
          if (currentStepIndex > 1) setStep(STEP_ORDER[currentStepIndex - 1]);
          else setStep("welcome");
        }}
        onRestart={handleRestart}
        onOpenFormula={() => setModalOpen(true)}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {step === "analyze" && (
          <div>
            <ComplaintForm onSubmit={handleAnalyze} loading={loading} error={error} />
            {loading && <div className="mt-8"><LoadingAnimation /></div>}
          </div>
        )}

        {step === "results" && analysis && metrics && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
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
                <p className="text-sm leading-relaxed text-slate-600">{analysis.analisis_legal}</p>
              </motion.div>
              <div className="mt-4">
                <ComplaintStatsPanel
                  empresa={analysis.empresa}
                  sector={analysis.producto_servicio}
                  pais={analysis.pais_detectado}
                />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-3">
              <RecommendationAlert metrics={metrics} currency={currency} />
              <FinancialChart metrics={metrics} currency={currency} />
              <JurisprudenciaList cases={relevantCases} />
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    if (!isSignedIn) { setShowLoginPrompt(true); return; }
                    markCompleted("results");
                    setStep("complaint");
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-medium text-white shadow-md transition-shadow hover:shadow-lg"
                >
                  Generar mi reclamo formal
                </button>
                <button
                  onClick={() => { markCompleted("results"); setStep("tracking"); }}
                  className="flex flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Ver mis opciones
                </button>
              </div>
            </div>
          </div>
        )}

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
                if (caseId) updateCase(caseId, { complaint_generated: true, status: "reclamo_generado" });
                setStep("arbitration");
              }}
            />
          </div>
        )}

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
                if (caseId) updateCase(caseId, { arbitration_completed: true, status: "en_mediacion" });
                setStep("tracking");
              }}
            />
          </div>
        )}

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
                if (caseId) updateCase(caseId, { status: "escalado" });
                setStep("tracking");
              }}
            />
          </div>
        )}

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

        {step === "feedback" && (
          <div className="py-8">
            <FeedbackRating caseId={caseId} onRestart={handleRestart} />
          </div>
        )}
      </main>

      {step !== "feedback" && <FooterMetrics />}
      <FormulaModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      {showLoginPrompt && <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />}
    </div>
  );
}
