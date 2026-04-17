/**
 * /api/notifications
 *
 * GET  — list notifications for the authenticated user (latest 50)
 * PATCH — mark notifications as read (by id or all)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logError, createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/notifications");

// ── Types ──────────────────────────────────────────────────────────────────────

export type NotificationType =
  | "company_response"
  | "status_change"
  | "ai_update"
  | "escalacion"
  | "sistema";

export interface Notification {
  readonly id: string;
  readonly user_id: string;
  readonly case_id: string | null;
  readonly tipo: NotificationType;
  readonly titulo: string;
  readonly mensaje: string;
  readonly leida: boolean;
  readonly created_at: string;
}

// ── PATCH schema ───────────────────────────────────────────────────────────────

const patchSchema = z.discriminatedUnion("accion", [
  z.object({ accion: z.literal("mark_read"), id: z.string().uuid() }),
  z.object({ accion: z.literal("mark_all_read") }),
]);

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  log.info({ url: request.url }, "Notifications GET");

  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`notifications-get:${ip}`, {
    limit: 60,
    windowSeconds: 60,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta en ${resetIn}s.` },
      { status: 429 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    logError("Notifications fetch error", error);
    return NextResponse.json(
      { error: "Error al cargar notificaciones." },
      { status: 500 }
    );
  }

  const unread = (data ?? []).filter((n) => !n.leida).length;

  log.info({ userId, total: data?.length ?? 0, unread }, "Notifications fetched");

  return NextResponse.json(
    { notifications: data ?? [], unread },
    {
      headers: {
        "Cache-Control": "private, no-cache",
      },
    }
  );
}

// ── PATCH ──────────────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  log.info({ url: request.url }, "Notifications PATCH");

  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`notifications-patch:${ip}`, {
    limit: 30,
    windowSeconds: 60,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta en ${resetIn}s.` },
      { status: 429 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  if (parsed.data.accion === "mark_all_read") {
    const { error } = await supabase
      .from("notifications")
      .update({ leida: true })
      .eq("user_id", userId)
      .eq("leida", false);

    if (error) {
      logError("Mark all read error", error);
      return NextResponse.json({ error: "Error al marcar." }, { status: 500 });
    }

    log.info({ userId }, "All notifications marked as read");
    return NextResponse.json({ ok: true });
  }

  // mark_read single
  const { error } = await supabase
    .from("notifications")
    .update({ leida: true })
    .eq("id", parsed.data.id)
    .eq("user_id", userId); // ownership check

  if (error) {
    logError("Mark read error", error);
    return NextResponse.json({ error: "Error al marcar." }, { status: 500 });
  }

  log.info({ userId, notificationId: parsed.data.id }, "Notification marked as read");
  return NextResponse.json({ ok: true });
}
