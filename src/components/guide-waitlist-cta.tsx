"use client";

import { useState } from "react";
import { posthog } from "@/lib/posthog";

interface GuideWaitlistCTAProps {
  source: string;
  headline: string;
  body: string;
  variant?: "inline" | "footer";
}

type Status = "idle" | "submitting" | "success" | "duplicate" | "error";

export function GuideWaitlistCTA({
  source,
  headline,
  body,
  variant = "inline",
}: GuideWaitlistCTAProps) {
  const [email, setEmail] = useState("");
  const [pais, setPais] = useState<"AR" | "MX">("AR");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("submitting");
    setErrorMsg("");
    posthog?.capture?.("guide_waitlist_submitted", { source, pais });

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pais, source }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "No pudimos registrarte. Probá de nuevo.");
        return;
      }
      setStatus(data.alreadyRegistered ? "duplicate" : "success");
    } catch {
      setStatus("error");
      setErrorMsg("Error de conexión. Probá de nuevo.");
    }
  }

  const containerClass =
    variant === "footer"
      ? "rounded-xl border border-slate-900 bg-slate-900 p-6 text-white"
      : "rounded-xl border border-amber-300 bg-amber-50 p-6 text-slate-900";

  const headlineClass =
    variant === "footer"
      ? "text-2xl font-bold text-white"
      : "text-xl font-bold text-slate-900";

  const bodyClass =
    variant === "footer" ? "mt-2 text-slate-300" : "mt-2 text-slate-700";

  const inputClass =
    variant === "footer"
      ? "w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
      : "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none";

  return (
    <section className={containerClass}>
      <h3 className={headlineClass}>{headline}</h3>
      <p className={bodyClass}>{body}</p>

      {status === "success" || status === "duplicate" ? (
        <p
          className="mt-4 font-semibold text-emerald-500"
          role="status"
        >
          {status === "duplicate"
            ? "✓ Ya estabas en la lista."
            : "✓ Listo. Te avisamos cuando lance."}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3" noValidate>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu-email@ejemplo.com"
              className={`${inputClass} flex-1`}
              autoComplete="email"
            />
            <select
              value={pais}
              onChange={(e) => setPais(e.target.value as "AR" | "MX")}
              className={inputClass.replace("flex-1", "")}
              aria-label="País"
            >
              <option value="AR">🇦🇷 AR</option>
              <option value="MX">🇲🇽 MX</option>
            </select>
            <button
              type="submit"
              disabled={!email || status === "submitting"}
              className="rounded-lg bg-amber-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
            >
              {status === "submitting" ? "..." : "Avisarme"}
            </button>
          </div>
          {status === "error" && (
            <p className="text-sm text-red-500" role="alert">
              {errorMsg}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
