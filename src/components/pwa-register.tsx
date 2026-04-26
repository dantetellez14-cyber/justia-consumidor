"use client";

/**
 * PwaRegister
 *
 * Client component that:
 * 1. Registers the service worker on mount (fires once).
 * 2. Listens for the `beforeinstallprompt` event and surfaces an install
 *    banner after 30s of engagement or when the user triggers it manually.
 * 3. Shows an "Instalar app" floating chip that dismisses on install or close.
 *
 * Renders nothing visible until the install prompt is available.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  prompt(): Promise<void>;
}

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  // Lazily initialise so we never call setState synchronously inside an effect
  const [installed, setInstalled] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches
  );

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {
          // Non-fatal — app still works without SW
        });
    }

    // Already running as installed PWA — nothing else to set up
    if (installed) {
      return;
    }

    // Capture install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show banner after 30 seconds of engagement
      const timer = setTimeout(() => setShowBanner(true), 30_000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Detect successful install
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, [installed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setDeferredPrompt(null);
    }
    setShowBanner(false);
  };

  // Nothing to render if already installed or no prompt
  if (installed || !deferredPrompt) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-2xl bg-indigo-600 px-5 py-3.5 shadow-2xl shadow-indigo-500/40"
          role="banner"
          aria-label="Instalar aplicación"
        >
          {/* Icon */}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <Download size={18} className="text-white" />
          </div>

          {/* Text */}
          <div>
            <p className="text-sm font-semibold text-white leading-none">
              Instalar JustIA
            </p>
            <p className="mt-0.5 text-xs text-indigo-200">
              Acceso rápido sin el navegador
            </p>
          </div>

          {/* Install button */}
          <button
            onClick={handleInstall}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition-colors"
          >
            Instalar
          </button>

          {/* Dismiss */}
          <button
            onClick={() => setShowBanner(false)}
            className="ml-1 rounded-full p-1 text-indigo-200 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
