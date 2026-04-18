"use client";

import { Bell } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/swr";

interface NotificationsResponse {
  unread: number;
}

/**
 * Bell icon that shows a red badge with the number of unread notifications.
 * Polls every 60 s so the count stays fresh without hammering the API.
 */
export function NotificationBell() {
  const { data } = useSWR<NotificationsResponse>("/api/notifications", fetcher, {
    refreshInterval: 60_000,
    // Don't throw on error — just show the bell with no badge
    onError: () => undefined,
  });

  const count = data?.unread ?? 0;

  return (
    <a
      href="/notificaciones"
      className="relative rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50"
      title={count > 0 ? `${count} notificación${count !== 1 ? "es" : ""} sin leer` : "Notificaciones"}
    >
      <Bell className="h-4 w-4" />

      {count > 0 && (
        <span
          className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-0.5 text-[10px] font-bold leading-none text-white"
          aria-label={`${count} sin leer`}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </a>
  );
}
