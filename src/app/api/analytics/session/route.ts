/**
 * POST /api/analytics/session
 * Body: { action: "start" | "end", sessionId?: string, meta?: object }
 *
 * - "start": creates a new user_sessions row, returns { sessionId }
 * - "end":   sets session_end + pages_visited on an existing row
 *
 * Auth: optional — works for both anon and signed-in users.
 * Never blocks the client even if Supabase is down.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { logError } from "@/lib/logger";

function detectDevice(ua: string): "mobile" | "tablet" | "desktop" | "unknown" {
  if (!ua) return "unknown";
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|phone/i.test(ua)) return "mobile";
  if (/mozilla|chrome|safari|firefox|edge/i.test(ua)) return "desktop";
  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, sessionId, pagesVisited, lastPage } = body as {
      action: "start" | "end";
      sessionId?: string;
      pagesVisited?: number;
      lastPage?: string;
    };

    // Get Clerk user info (optional — anon users tracked too)
    const { userId } = await auth().catch(() => ({ userId: null }));

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null;
    const userAgent = request.headers.get("user-agent") ?? "";
    const country = request.headers.get("x-vercel-ip-country") ?? null;

    if (action === "start") {
      // Resolve email from Clerk if signed in
      let email: string | null = null;
      if (userId) {
        // Email is not available server-side without Clerk backend SDK call,
        // so we store it when the client sends it
        email = (body as { email?: string }).email ?? null;
      }

      const { data, error } = await supabase
        .from("user_sessions")
        .insert({
          user_id: userId ?? null,
          email,
          ip,
          user_agent: userAgent.slice(0, 512),
          country,
          device_type: detectDevice(userAgent),
          pages_visited: 1,
          last_page: lastPage ?? "/",
        })
        .select("id")
        .single();

      if (error) {
        logError("Session start error", error, { route: "/api/analytics/session" });
        return NextResponse.json({ ok: false }, { status: 200 }); // never 500 — non-blocking
      }

      return NextResponse.json({ ok: true, sessionId: data.id });
    }

    if (action === "end" && sessionId) {
      const { error } = await supabase
        .from("user_sessions")
        .update({
          session_end: new Date().toISOString(),
          pages_visited: pagesVisited ?? 1,
          last_page: lastPage ?? null,
        })
        .eq("id", sessionId);

      if (error) {
        logError("Session end error", error, { route: "/api/analytics/session" });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    logError("Session analytics error", err, { route: "/api/analytics/session" });
    return NextResponse.json({ ok: false }, { status: 200 }); // always 200 — non-blocking
  }
}
