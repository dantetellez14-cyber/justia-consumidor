"use client";

import { useState, useCallback, useEffect } from "react";
import { CaseAnalysis, FinancialMetrics, JurisprudenciaCase } from "@/lib/types";
import { calculateFinancialMetrics } from "@/lib/scoring";
import { fetchCasesByCountry } from "@/lib/jurisprudencia";
import { saveCase, updateCase } from "@/lib/cases-client";
import { posthog } from "@/lib/posthog";
import type { ComplaintFormData } from "@/components/complaint-form";

export type AppStep =
  | "welcome"
  | "analyze"
  | "results"
  | "complaint"
  | "arbitration"
  | "escalation"
  | "tracking"
  | "feedback";

export const STEP_LABELS: Record<AppStep, string> = {
  welcome: "Inicio",
  analyze: "Consulta",
  results: "Análisis",
  complaint: "Reclamo",
  arbitration: "Mediación",
  escalation: "Escalamiento",
  tracking: "Seguimiento",
  feedback: "Feedback",
};

export const STEP_ORDER: AppStep[] = [
  "welcome",
  "analyze",
  "results",
  "complaint",
  "arbitration",
  "escalation",
  "tracking",
  "feedback",
];

export function useComplaintFlow() {
  const [step, setStep] = useState<AppStep>("welcome");
  const [, setRelato] = useState("");
  const [analysis, setAnalysis] = useState<CaseAnalysis | null>(null);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [relevantCases, setRelevantCases] = useState<ReadonlyArray<JurisprudenciaCase>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<AppStep>>(new Set());
  const [caseId, setCaseId] = useState<string | null>(null);

  useEffect(() => {
    const proAction = localStorage.getItem("proAction");
    if (proAction) {
      localStorage.removeItem("proAction");
      if (proAction === "restore") {
        const saved = localStorage.getItem("pendingAnalysis");
        if (saved) {
          try {
            const savedAnalysis: CaseAnalysis = JSON.parse(saved);
            localStorage.removeItem("pendingAnalysis");
            setAnalysis(savedAnalysis);
            setMetrics(calculateFinancialMetrics(savedAnalysis));
            setStep("complaint");
            return;
          } catch { /* fall through */ }
        }
      }
      setStep("analyze");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("start") === "true") {
      window.history.replaceState({}, "", "/");
      setStep("analyze");
    }
  }, []);

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

        const enrichedAnalysis: CaseAnalysis = {
          ...data,
          empresa: submittedForm.empresa || data.empresa,
          producto_servicio: submittedForm.producto || data.producto_servicio,
          ...(submittedForm.monto ? { monto_reclamo: Number(submittedForm.monto) } : {}),
          ...(submittedForm.fechaCompra ? { fecha_incidente: submittedForm.fechaCompra } : {}),
          pais_detectado: submittedForm.moneda === "MXN" ? "MX" : data.pais_detectado,
        };

        setAnalysis(enrichedAnalysis);
        setMetrics(calculateFinancialMetrics(enrichedAnalysis));

        const searchQuery = `${enrichedAnalysis.empresa} ${enrichedAnalysis.producto_servicio} ${enrichedAnalysis.core_grievance}`;
        try {
          const searchRes = await fetch("/api/search-jurisprudencia", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: searchQuery, pais: enrichedAnalysis.pais_detectado }),
          });
          const searchData = await searchRes.json();
          if (searchData.cases && searchData.cases.length > 0) {
            setRelevantCases(searchData.cases);
          } else {
            setRelevantCases(await fetchCasesByCountry(enrichedAnalysis.pais_detectado));
          }
        } catch {
          setRelevantCases(await fetchCasesByCountry(enrichedAnalysis.pais_detectado));
        }

        markCompleted("analyze");

        posthog.capture("case_analyzed", {
          empresa: enrichedAnalysis.empresa,
          pais: enrichedAnalysis.pais_detectado,
          categoria: enrichedAnalysis.producto_servicio,
          probabilidad_exito: enrichedAnalysis.probabilidad_exito,
          monto_reclamo: enrichedAnalysis.monto_reclamo,
        });

        const savedId = await saveCase(composedRelato, enrichedAnalysis);
        if (savedId) setCaseId(savedId);

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

  return {
    step,
    setStep,
    analysis,
    metrics,
    relevantCases,
    loading,
    error,
    completedSteps,
    caseId,
    markCompleted,
    handleAnalyze,
    handleRestart,
    updateCase,
  };
}
