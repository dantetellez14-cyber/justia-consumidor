"use client";

import { Scale, Shield, Clock, FileText, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

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
                  Iniciar sesión
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-200">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Defendé tus derechos como consumidor
            </h1>
            <h2 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 sm:text-5xl">
              de forma simple y gratuita
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500">
              La justicia no debe ser un laberinto, sino un camino con señales claras.
              Nuestra IA te asesora, genera tu reclamo y te acompaña hasta la resolución.
            </p>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-200 transition-shadow hover:shadow-xl hover:shadow-blue-300"
            >
              Comenzar tu reclamo
              <ArrowRight className="h-5 w-5" />
            </motion.button>

            <button
              onClick={onStart}
              className="mt-3 block mx-auto text-sm text-slate-400 underline underline-offset-2 hover:text-slate-600"
            >
              Ver cómo funciona
            </button>
          </motion.div>

          {/* How it works */}
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

          {/* Features Grid */}
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

          {/* Trust bar */}
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
      <footer className="border-t border-slate-100 py-6 text-center">
        <p className="text-xs text-slate-400">
          JustIA Consumidor &mdash; Cuando una empresa falla, tus derechos no deben fallar contigo.
        </p>
      </footer>
    </div>
  );
}
