"use client";

import { Scale } from "lucide-react";

export default function ProSuccessPage() {
  const handleContinue = () => {
    // Use localStorage flag instead of URL params — avoids Next.js SSR hydration issues
    const saved = localStorage.getItem("pendingAnalysis");
    localStorage.setItem("proAction", saved ? "restore" : "start");
    window.location.href = "/";
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#020617" }}
    >
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl p-2.5" style={{ background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)" }}>
          <Scale className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold text-white">JustIA Consumidor</span>
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-5xl">
          🎉
        </div>

        <h2 className="text-2xl font-black text-slate-800">¡Ya eres Pro!</h2>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Tu suscripción está activa. Ahora puedes generar cartas de reclamo
          formales ilimitadas durante 1 año.
        </p>

        <div className="mt-6 space-y-3">
          <button
            onClick={handleContinue}
            className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)" }}
          >
            Comenzar mi reclamo →
          </button>

          <button
            onClick={() => { window.location.href = "/"; }}
            className="w-full rounded-xl border border-slate-200 py-3 text-sm text-slate-400 hover:bg-slate-50"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
