"use client";

import { Scale, Shield, Clock, FileText, Users, ArrowRight, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { Card } from "@/components/ui/card";

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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-2.5">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">JustIA Consumidor</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/empresa"
              className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              <Building2 className="h-3.5 w-3.5" />
              Soy empresa
            </Link>
            {isSignedIn ? (
              <>
                <a
                  href="/mis-casos"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Mis casos
                </a>
                <UserButton />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
                  Iniciar sesion
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-10">

          {/* ── 3D Hero Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="w-full h-[520px] bg-black/[0.96] relative overflow-hidden border-0 shadow-2xl">
              <Spotlight
                className="-top-40 left-0 md:left-60 md:-top-20"
                fill="white"
              />

              <div className="flex h-full flex-col md:flex-row">
                {/* Left — text content */}
                <div className="flex flex-1 flex-col justify-center p-8 md:p-12 relative z-10">
                  {/* Badge */}
                  <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5">
                    <Shield className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-xs font-medium text-indigo-300">
                      IA Legal · Gratuito
                    </span>
                  </div>

                  <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
                    Defendé tus derechos{" "}
                    <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      como consumidor
                    </span>
                  </h1>

                  <p className="mt-2 text-2xl font-bold text-neutral-300 md:text-3xl">
                    de forma simple y gratuita
                  </p>

                  <p className="mt-5 max-w-md text-base leading-relaxed text-neutral-400">
                    La justicia no debe ser un laberinto, sino un camino con señales claras.
                    Nuestra IA te asesora, genera tu reclamo y te acompaña hasta la resolución.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={onStart}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-900/40 transition-shadow hover:shadow-xl"
                    >
                      Comenzar tu reclamo
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>

                    <button
                      onClick={onStart}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-base font-medium text-neutral-300 transition-colors hover:bg-white/10"
                    >
                      Ver cómo funciona
                    </button>
                  </div>
                </div>

                {/* Right — Spline robot */}
                <div className="relative flex-1 min-h-[260px] md:min-h-0">
                  <SplineScene
                    scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* ── How it works ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-20"
          >
            <h3 className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-slate-400">
              Cómo funciona
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="relative rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-lg font-bold text-white">
                    {step.number}
                  </div>
                  <p className="text-sm font-medium text-slate-700">{step.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Features Grid ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20"
          >
            <h3 className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-slate-400">
              Lo que ofrecemos
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex gap-4 rounded-xl border border-slate-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <f.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{f.title}</h4>
                    <p className="mt-1 text-sm text-slate-500">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Company CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-20"
          >
            <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg shadow-emerald-200">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-slate-800">Sos una empresa?</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Gestiona reclamos de forma eficiente, reduce litigios y mejora tu reputacion.
                    Accede al panel empresarial para responder reclamos antes de que escalen.
                  </p>
                </div>
                <Link
                  href="/empresa"
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-shadow hover:shadow-lg"
                >
                  <Building2 className="h-4 w-4" />
                  Portal empresarial
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ── Trust bar ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-16 rounded-xl bg-slate-50 p-6 text-center"
          >
            <p className="text-sm text-slate-500">
              Basado en la <strong>Ley 24.240</strong> de Defensa del Consumidor (Argentina) y la{" "}
              <strong>Ley Federal de Protección al Consumidor</strong> (México).
              Tu información se procesa de forma segura y local.
            </p>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-slate-400">
            JustIA Consumidor &mdash; Cuando una empresa falla, tus derechos no deben fallar contigo.
          </p>
          <div className="flex gap-4">
            <Link href="/privacidad" className="text-xs text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline">
              Privacidad
            </Link>
            <Link href="/terminos" className="text-xs text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline">
              Términos de uso
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
