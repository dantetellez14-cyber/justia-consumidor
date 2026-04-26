"use client";

import { Scale, Shield, Clock, FileText, Users, ChevronRight, Building2 } from "lucide-react";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";

interface Props {
  readonly onStart: () => void;
}

const features = [
  {
    icon: Scale,
    title: "Asesoramiento Legal IA",
    description: "Analizamos tu caso y te orientamos sobre tus derechos como consumidor.",
  },
  {
    icon: FileText,
    title: "Reclamos Automáticos",
    description: "Generamos una nota formal de reclamo lista para enviar a la empresa.",
  },
  {
    icon: Users,
    title: "Arbitraje Asistido",
    description: "Si la empresa no responde, nuestra IA evalúa ambas posiciones de forma imparcial.",
  },
  {
    icon: Clock,
    title: "Seguimiento en Tiempo Real",
    description: "Monitorea el estado de tu reclamo y recibe sugerencias de próximos pasos.",
  },
];

const steps = [
  { number: "1", label: "Contá tu problema en tus palabras" },
  { number: "2", label: "La IA analiza tu caso y tus derechos" },
  { number: "3", label: "Generamos tu reclamo formal" },
  { number: "4", label: "Te acompañamos hasta la resolución" },
];

export function WelcomeHero({ onStart }: Props) {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#020617", backgroundImage: "radial-gradient(circle at 20% 20%, rgba(168,85,247,0.15) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(99,102,241,0.15) 0%, transparent 40%)" }}>
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur sticky top-0 z-50" style={{ backgroundColor: "rgba(2,6,23,0.8)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl p-2.5" style={{ background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)" }}>
              <Scale className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">JustIA Consumidor</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/empresa"
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
            >
              <Building2 className="h-3.5 w-3.5" />
              Soy empresa
            </Link>
            {isSignedIn ? (
              <>
                <a
                  href="/mis-casos"
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
                >
                  Mis casos
                </a>
                <UserButton />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5">
                  Iniciar sesion
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-10 space-y-24 pb-20">

          {/* ── Hero Card ── */}
          <div
            className="w-full rounded-[2.5rem] relative overflow-hidden border border-white/10 flex flex-col items-center justify-center mt-4"
            style={{ background: "radial-gradient(ellipse at 20% 40%, rgba(168,85,247,0.25) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.2) 0%, transparent 50%), rgba(2,2,10,0.98)", minHeight: "600px" }}
          >
            <div className="w-full max-w-4xl px-8 md:px-12 flex flex-col items-center justify-center text-center py-20">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-10 shadow-2xl"
                style={{ background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)", boxShadow: "0 25px 50px -12px rgba(168,85,247,0.3)" }}
              >
                <Shield className="text-white w-10 h-10" />
              </div>

              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-8"
                style={{ color: "transparent", backgroundImage: "linear-gradient(to bottom, #f8fafc, #94a3b8)", backgroundClip: "text", WebkitBackgroundClip: "text" }}
              >
                Defendé tus derechos{" "}
                <br className="hidden md:block" />
                como consumidor
                <br />
                <span style={{ backgroundImage: "linear-gradient(to right, #a855f7, #6366f1)", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}>
                  de forma simple y gratuita
                </span>
              </h1>

              <p className="text-neutral-300 text-xl md:text-2xl max-w-3xl mb-14 leading-relaxed font-medium">
                La justicia no debe ser un laberinto, sino un camino con señales claras.
                Nuestra IA te asesora, genera tu reclamo y te acompaña hasta la resolución.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
                {isSignedIn ? (
                  <button
                    onClick={onStart}
                    className="flex items-center justify-center gap-3 px-10 py-5 rounded-2xl text-white font-bold text-xl transition-all hover:scale-105 group"
                    style={{ background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)", boxShadow: "0 25px 50px -12px rgba(168,85,247,0.3)" }}
                  >
                    Comenzar tu reclamo
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <SignInButton mode="modal" fallbackRedirectUrl="/?start=true">
                    <button
                      className="flex items-center justify-center gap-3 px-10 py-5 rounded-2xl text-white font-bold text-xl transition-all hover:scale-105 group"
                      style={{ background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)", boxShadow: "0 25px 50px -12px rgba(168,85,247,0.3)" }}
                    >
                      Comenzar tu reclamo
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </SignInButton>
                )}
                <button
                  onClick={isSignedIn ? onStart : undefined}
                  className="text-purple-400 font-bold hover:text-purple-300 transition-colors text-lg px-8 py-4"
                >
                  Ver cómo funciona
                </button>
              </div>
            </div>
          </div>

          {/* ── Cómo funciona ── */}
          <section className="space-y-12">
            <div className="text-center">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">CÓMO FUNCIONA</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="relative rounded-2xl border border-white/10 p-5"
                  style={{ background: "rgba(30,41,59,0.6)", backdropFilter: "blur(12px)" }}
                >
                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)" }}
                  >
                    {step.number}
                  </div>
                  <p className="text-sm font-medium text-slate-200">{step.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Features ── */}
          <section className="space-y-12">
            <div className="text-center">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">LO QUE OFRECEMOS</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex gap-4 rounded-2xl border border-white/10 p-6"
                  style={{ background: "rgba(30,41,59,0.6)", backdropFilter: "blur(12px)" }}
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "rgba(168,85,247,0.15)" }}
                  >
                    <f.icon className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{f.title}</h4>
                    <p className="mt-1 text-sm text-slate-400">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Company CTA ── */}
          <section>
            <div
              className="rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-emerald-500/10"
              style={{ background: "rgba(16,185,129,0.05)" }}
            >
              <div className="flex items-center gap-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(16,185,129,1)", boxShadow: "0 10px 25px -5px rgba(16,185,129,0.2)" }}
                >
                  <Building2 className="text-white w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">¿Sos una empresa?</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Gestioná reclamos de forma eficiente, reducí litigios y mejorá tu reputación.
                  </p>
                </div>
              </div>
              <Link
                href="/empresa"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
              >
                <Building2 className="h-4 w-4" />
                Portal empresarial
              </Link>
            </div>
          </section>

          {/* ── Trust bar ── */}
          <div
            className="rounded-2xl border border-white/10 p-6 text-center"
            style={{ background: "rgba(30,41,59,0.4)" }}
          >
            <p className="text-sm text-slate-500">
              Basado en la <strong className="text-slate-300">Ley 24.240</strong> de Defensa del Consumidor (Argentina) y la{" "}
              <strong className="text-slate-300">Ley Federal de Protección al Consumidor</strong> (México).
              Tu información se procesa de forma segura y local.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-slate-500">
            JustIA Consumidor &mdash; Cuando una empresa falla, tus derechos no deben fallar contigo.
          </p>
          <div className="flex gap-4">
            <Link href="/privacidad" className="text-xs text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline">
              Privacidad
            </Link>
            <Link href="/terminos" className="text-xs text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline">
              Términos de uso
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
