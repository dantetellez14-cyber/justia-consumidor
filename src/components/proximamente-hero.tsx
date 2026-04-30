"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { posthog } from "@/lib/posthog";

type Country = "AR" | "MX";
type Status = "idle" | "submitting" | "success" | "error" | "duplicate";

interface SubmitResponse {
  ok?: boolean;
  alreadyRegistered?: boolean;
  error?: string;
}

interface CountResponse {
  count: number;
}

export function ProximamenteHero() {
  const [email, setEmail] = useState("");
  const [pais, setPais] = useState<Country | "">("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    posthog?.capture?.("waitlist_view");
    fetch("/api/waitlist")
      .then((res) => (res.ok ? (res.json() as Promise<CountResponse>) : null))
      .then((data) => {
        if (data && typeof data.count === "number") setCount(data.count);
      })
      .catch(() => {
        // Silent fail — count is optional UI affordance.
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !pais) return;

    setStatus("submitting");
    setErrorMsg("");
    posthog?.capture?.("waitlist_submitted", { pais });

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pais, source: "proximamente" }),
      });

      const data: SubmitResponse = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "No pudimos registrarte. Probá de nuevo.");
        posthog?.capture?.("waitlist_error", { reason: data.error });
        return;
      }

      if (data.alreadyRegistered) {
        setStatus("duplicate");
      } else {
        setStatus("success");
        startTransition(() => {
          if (count !== null) setCount(count + 1);
        });
      }
    } catch {
      setStatus("error");
      setErrorMsg("Error de conexión. Probá de nuevo.");
      posthog?.capture?.("waitlist_error", { reason: "network" });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span aria-hidden>🛡️</span>
          <span>JustIA</span>
        </div>
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
          Próximamente
        </span>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-12 pb-20 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-6 text-sm font-semibold uppercase tracking-widest text-amber-400">
            Pronto en Argentina y México
          </p>

          <h1 className="text-4xl font-black leading-[1.05] sm:text-6xl md:text-7xl">
            El abogado de IA que pelea
            <br />
            tus reclamos.{" "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              Gratis.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl md:text-2xl">
            Generamos tu reclamo formal en 5 minutos, con jurisprudencia real.
            Sin abogado. Sin filas. Sin frustración.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 max-w-md"
        >
          {status !== "success" && status !== "duplicate" ? (
            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => posthog?.capture?.("waitlist_email_focused")}
                placeholder="tu-email@ejemplo.com"
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-base text-white placeholder-slate-500 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
              />

              <fieldset className="mt-4">
                <legend className="sr-only">País</legend>
                <div className="flex gap-3">
                  {(["AR", "MX"] as const).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setPais(code);
                        posthog?.capture?.("waitlist_country_selected", {
                          pais: code,
                        });
                      }}
                      aria-pressed={pais === code}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                        pais === code
                          ? "border-amber-400 bg-amber-400/10 text-amber-300"
                          : "border-white/20 bg-white/5 text-slate-300 hover:border-white/40"
                      }`}
                    >
                      <span aria-hidden>{code === "AR" ? "🇦🇷" : "🇲🇽"}</span>
                      <span>{code === "AR" ? "Argentina" : "México"}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={
                  !email || !pais || status === "submitting"
                }
                className="mt-5 w-full rounded-lg bg-amber-500 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "submitting" ? "Anotándote..." : "Avisame cuando lance"}
              </button>

              {status === "error" && (
                <p className="mt-3 text-sm text-red-400" role="alert">
                  {errorMsg}
                </p>
              )}

              <p className="mt-3 text-xs text-slate-400">
                {count && count > 50
                  ? `✓ ${count.toLocaleString("es-AR")} personas ya están esperando · Sin spam`
                  : "✓ Sé de los primeros 100 · Sin spam"}
              </p>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6"
              role="status"
            >
              <p className="text-lg font-semibold text-emerald-400">
                {status === "duplicate"
                  ? "Ya estabas en la lista ✓"
                  : "Listo. Vas a ser de los primeros en saber. ✓"}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Mientras tanto, seguinos para ver el progreso del lanzamiento.
              </p>
            </motion.div>
          )}
        </motion.div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 border-t border-white/10">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Reclamar como consumidor en LATAM está roto
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: "⏱️",
              title: "PROFECO/DCC tarda meses",
              body: "Procesos burocráticos sin tecnología. Vos esperás. La empresa gana.",
            },
            {
              icon: "💸",
              title: "Abogados cuestan más que el reclamo",
              body: "No toman casos chicos. Resultado: la empresa abusa con impunidad.",
            },
            {
              icon: "🤐",
              title: "La empresa te ignora",
              body: "Call centers que no resuelven. Soportes robotizados. Vos te resignás.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <div className="text-3xl" aria-hidden>
                {card.icon}
              </div>
              <h3 className="mt-3 font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{card.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-base text-slate-300">
          Resultado: 9 de cada 10 personas no reclama. Las empresas lo saben.
          Y abusan.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 border-t border-white/10">
        <h2 className="text-2xl font-bold sm:text-3xl">Cómo va a funcionar</h2>
        <ol className="mt-8 space-y-6">
          {[
            {
              n: "1",
              title: "Contás tu caso en 60 segundos",
              body: "Sin formularios infinitos. Cargás un ejemplo si no sabés por dónde empezar.",
            },
            {
              n: "2",
              title: "Nuestra IA analiza tu caso",
              body: "Probabilidad de ganar, valor esperado en pesos, jurisprudencia real que aplica.",
            },
            {
              n: "3",
              title: "Mandamos el reclamo formal por vos",
              body: "Carta legal lista, firmada por vos, enviada a la empresa con copia a tu email.",
            },
          ].map((step) => (
            <li key={step.n} className="flex gap-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-slate-950">
                {step.n}
              </div>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 border-t border-white/10">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Construido sobre datos reales
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: "344.500", label: "quejas históricas indexadas" },
            { value: "100+", label: "casos de jurisprudencia" },
            { value: "AR / MX", label: "marcos legales aplicados" },
            { value: "7 capas", label: "de seguridad" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
            >
              <div className="text-3xl font-black text-amber-400">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-6 py-12 border-t border-white/10">
        <p className="text-sm text-slate-400">
          JustIA — Cuando una empresa falla, tus derechos no.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          © 2026 · Hecho en Argentina 🇦🇷
        </p>
      </footer>
    </div>
  );
}
