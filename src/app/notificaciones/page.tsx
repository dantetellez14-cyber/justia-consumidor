"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Scale,
  ArrowLeft,
  Bell,
  Check,
  MessageSquare,
  FileText,
  Gavel,
  Activity,
  Info,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { fetcher } from "@/lib/swr";
import type { Notification, NotificationType } from "@/app/api/notifications/route";

// ── Icon per notification type ─────────────────────────────────────────────────

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  company_response: <MessageSquare size={18} />,
  status_change: <Activity size={18} />,
  ai_update: <FileText size={18} />,
  escalacion: <Gavel size={18} />,
  sistema: <Info size={18} />,
};

const TYPE_COLOR: Record<NotificationType, string> = {
  company_response: "bg-rose-500/20 text-rose-400 border-rose-500/20",
  status_change: "bg-indigo-500/20 text-indigo-400 border-indigo-500/20",
  ai_update: "bg-cyan-500/20 text-cyan-400 border-cyan-500/20",
  escalacion: "bg-amber-500/20 text-amber-400 border-amber-500/20",
  sistema: "bg-slate-500/20 text-slate-400 border-slate-500/20",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora mismo";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}

// ── Notification card ──────────────────────────────────────────────────────────

function NotifCard({
  notif,
  onRead,
}: {
  notif: Notification;
  onRead: (id: string) => void;
}) {
  const iconColor = TYPE_COLOR[notif.tipo] ?? TYPE_COLOR.sistema;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`relative flex gap-4 p-5 rounded-xl border transition-all ${
        notif.leida
          ? "bg-[#1e293b]/60 border-slate-800 opacity-70 hover:opacity-100"
          : "bg-[#1e293b] border-slate-700/60 ring-1 ring-indigo-500/10"
      }`}
    >
      {/* Unread indicator */}
      {!notif.leida && (
        <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-indigo-500 rounded-full" />
      )}

      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${iconColor}`}
      >
        {TYPE_ICON[notif.tipo]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className={`font-medium text-sm ${notif.leida ? "text-slate-400" : "text-white"}`}>
            {notif.titulo}
          </p>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0">
            {timeAgo(notif.created_at)}
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-snug mt-1">{notif.mensaje}</p>

        <div className="flex items-center gap-3 mt-3">
          {notif.case_id && (
            <Link
              href={`/mis-casos/seguimiento?id=${notif.case_id}`}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Ver caso →
            </Link>
          )}
          {!notif.leida && (
            <button
              onClick={() => onRead(notif.id)}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
            >
              <Check size={10} />
              Marcar leída
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-5">
        <Bell size={28} className="text-slate-600" />
      </div>
      <h2 className="text-lg font-medium text-slate-400 mb-2">Sin notificaciones</h2>
      <p className="text-sm text-slate-600 max-w-xs">
        Aquí aparecerán las actualizaciones de tus casos: respuestas de empresas,
        cambios de estado y alertas del sistema.
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NotificacionesPage() {
  const { isSignedIn, isLoaded } = useAuth();

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<{ notifications: Notification[]; unread: number }>(
    isLoaded && isSignedIn ? "/api/notifications" : null,
    fetcher,
    {
      refreshInterval: 15000,     // poll every 15s
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  const notifications = data?.notifications ?? [];
  const unread = data?.unread ?? 0;

  // Mark a single notification as read
  const handleMarkRead = useCallback(
    async (id: string) => {
      // Optimistic update
      await mutate(
        (prev) =>
          prev
            ? {
                ...prev,
                unread: Math.max(0, prev.unread - 1),
                notifications: prev.notifications.map((n) =>
                  n.id === id ? { ...n, leida: true } : n
                ),
              }
            : prev,
        false
      );
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "mark_read", id }),
      });
      await mutate();
    },
    [mutate]
  );

  // Mark all as read
  const handleMarkAllRead = useCallback(async () => {
    await mutate(
      (prev) =>
        prev
          ? {
              ...prev,
              unread: 0,
              notifications: prev.notifications.map((n) => ({ ...n, leida: true })),
            }
          : prev,
      false
    );
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "mark_all_read" }),
    });
    await mutate();
  }, [mutate]);

  // ── Auth states ──────────────────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <Loader2 size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] text-slate-300 gap-6">
        <AlertTriangle size={48} className="text-amber-500" />
        <p className="text-lg font-medium text-white">Iniciá sesión para ver tus notificaciones</p>
        <Link
          href="/"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Ir al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-300 font-sans">
      {/* Sidebar */}
      <div className="w-20 bg-[#1e293b] border-r border-slate-800 flex flex-col items-center py-6 justify-between shrink-0">
        <Link
          href="/"
          className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"
        >
          <Scale size={20} />
        </Link>
        <div className="relative">
          <div className="p-3 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <Bell size={22} />
          </div>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center px-1">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>
        <Link
          href="/"
          className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ArrowLeft size={22} />
        </Link>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-indigo-400" />
            <h1 className="text-white font-medium">Notificaciones</h1>
            {unread > 0 && (
              <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unread} nuevas
              </span>
            )}
          </div>

          {unread > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <CheckCircle2 size={14} />
              Marcar todas como leídas
            </button>
          )}
        </header>

        <main className="max-w-2xl mx-auto px-6 py-8">
          {/* Loading */}
          {isLoading && notifications.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="text-indigo-400 animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
              <AlertTriangle size={16} />
              No se pudieron cargar las notificaciones.
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && notifications.length === 0 && <EmptyState />}

          {/* Notifications list */}
          {notifications.length > 0 && (
            <div className="space-y-3">
              {/* Unread section */}
              {notifications.some((n) => !n.leida) && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
                    Nuevas
                  </p>
                  <AnimatePresence mode="popLayout">
                    {notifications
                      .filter((n) => !n.leida)
                      .map((n) => (
                        <NotifCard key={n.id} notif={n} onRead={handleMarkRead} />
                      ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Read section */}
              {notifications.some((n) => n.leida) && (
                <div className={notifications.some((n) => !n.leida) ? "mt-8" : ""}>
                  {notifications.some((n) => !n.leida) && (
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 px-1">
                      Anteriores
                    </p>
                  )}
                  <AnimatePresence mode="popLayout">
                    {notifications
                      .filter((n) => n.leida)
                      .map((n) => (
                        <NotifCard key={n.id} notif={n} onRead={handleMarkRead} />
                      ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* Refresh note */}
          {!isLoading && notifications.length > 0 && (
            <p className="text-center text-xs text-slate-700 mt-10">
              Se actualiza automáticamente cada 15 segundos
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
