"use client";

import { motion } from "framer-motion";
import { Scale } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";

interface LoginPromptModalProps {
  onClose: () => void;
}

export function LoginPromptModal({ onClose }: LoginPromptModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[90vw] sm:max-w-sm rounded-2xl bg-white p-6 sm:p-8 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
          <Scale className="h-7 w-7 text-white" />
        </div>

        <h2 className="text-xl font-black text-slate-800">Casi listo 🎉</h2>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Tu análisis está completo. Inicia sesión para generar tu carta de reclamo formal y guardar tu caso.
        </p>

        <div className="mt-6 space-y-3">
          <SignInButton mode="modal" fallbackRedirectUrl="/?continuar=reclamo">
            <button
              className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
              onClick={onClose}
            >
              Iniciar sesión con Google
            </button>
          </SignInButton>

          <button
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Gratis · Sin tarjeta requerida para iniciar sesión
        </p>
      </motion.div>
    </div>
  );
}
