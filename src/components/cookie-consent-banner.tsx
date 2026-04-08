"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import {
  getStoredConsent,
  setStoredConsent,
  optOutPostHog,
} from "@/lib/posthog";

interface Props {
  readonly onConsent: (accepted: boolean) => void;
}

export function CookieConsentBanner({ onConsent }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if no consent decision has been made
    const stored = getStoredConsent();
    if (stored === null) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setStoredConsent("accepted");
    setVisible(false);
    onConsent(true);
  };

  const handleReject = () => {
    setStoredConsent("rejected");
    optOutPostHog();
    setVisible(false);
    onConsent(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Cookie className="h-5 w-5 text-blue-600" />
              </div>

              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Uso de cookies
                  </h3>
                  <button
                    onClick={handleReject}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Cerrar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-xs leading-relaxed text-slate-500">
                  Usamos cookies esenciales para autenticacion (Clerk) y cookies
                  opcionales de analitica (PostHog) para mejorar tu experiencia.
                  Las cookies de analitica solo se activan con tu consentimiento.{" "}
                  <Link
                    href="/privacidad"
                    className="font-medium text-blue-600 underline-offset-2 hover:underline"
                  >
                    Politica de privacidad
                  </Link>
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleAccept}
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    Aceptar todas
                  </button>
                  <button
                    onClick={handleReject}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Solo esenciales
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
