/**
 * /api/admin/metrics
 *
 * GET — platform-wide analytics for the admin dashboard.
 *
 * Protected by ADMIN_SECRET header or a list of allowed Clerk user IDs
 * set in ADMIN_USER_IDS (comma-separated).
 *
 * Returns aggregated metrics from Supabase:
 * - Total cases (all-time & last 30 days)
 * - Cases by status
 * - Cases by country
 * - Top complained companies
 * - Daily volume (last 30 days)
 * - Average claim amount
 * - Resolution rate
 * - Feedback stats
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/admin/metrics");

// ── Auth helper ─────────────────────────────────────────────────────────────

function isAdminUser(userId: string): boolean {
  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return adminIds.includes(userId);
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface AdminMetrics {
  readonly totals: {
    readonly cases: number;
    readonly cases30d: number;
    readonly complaints_generated: number;
    readonly resolved: number;
    readonly escalated: number;
  };
  readonly by_status: ReadonlyArray<{ status: string; count: number }>;
  readonly by_country: ReadonlyArray<{ pais: string; count: number }>;
  readonly top_companies: ReadonlyArray<{ empresa: string; count: number; resolved: number }>;
  readonly daily_volume: ReadonlyArray<{ date: string; count: number }>;
  readonly financial: {
    readonly avg_claim: number;
    readonly total_claimed: number;
    readonly avg_success_score: number;
  };
  readonly feedback: {
    readonly avg_rating: number;
    readonly total_responses: number;
    readonly distribution: ReadonlyArray<{ rating: number; count: number }>;
  };
  readonly resolution_rate: number; // 0-100
  readonly generated_at: string;
}

// ── GET ──────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`admin-metrics:${ip}`, {
    limit: 20,
    windowSeconds: 60,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Retry in ${resetIn}s.` },
      { status: 429 }
    );
  }

  // Auth: Clerk session required + admin role
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin secret header OR allowed user IDs list
  const adminSecret = request.headers.get("x-admin-secret");
  const validSecret = process.env.ADMIN_SECRET && adminSecret === process.env.ADMIN_SECRET;

  if (!validSecret && !isAdminUser(userId)) {
    log.warn({ userId }, "Unauthorized admin metrics access attempt");
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  log.info({ userId }, "Admin metrics requested");

  try {
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Run all queries in parallel
    const [
      casesAll,
      cases30d,
      byStatus,
      byCountry,
      topCompanies,
      dailyVolume,
      financialData,
      feedbackData,
    ] = await Promise.all([
      // Total cases
      supabase
        .from("cases")
        .select("id", { count: "exact", head: true }),

      // Cases last 30 days
      supabase
        .from("cases")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since30d),

      // Cases by status
      supabase
        .from("cases")
        .select("status"),

      // Cases by country
      supabase
        .from("cases")
        .select("pais_detectado"),

      // Top complained companies
      supabase
        .from("cases")
        .select("empresa, status")
        .not("empresa", "is", null)
        .not("empresa", "eq", ""),

      // Daily volume last 30 days
      supabase
        .from("cases")
        .select("created_at")
        .gte("created_at", since30d)
        .order("created_at", { ascending: true }),

      // Financial data
      supabase
        .from("cases")
        .select("monto_reclamo, probabilidad_exito")
        .not("monto_reclamo", "is", null),

      // Feedback
      supabase
        .from("feedback")
        .select("rating"),
    ]);

    // ── Process by_status ──
    const statusMap: Record<string, number> = {};
    for (const row of byStatus.data ?? []) {
      const s = row.status ?? "unknown";
      statusMap[s] = (statusMap[s] ?? 0) + 1;
    }
    const byStatusArr = Object.entries(statusMap)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    // ── Process by_country ──
    const countryMap: Record<string, number> = {};
    for (const row of byCountry.data ?? []) {
      const p = row.pais_detectado ?? "unknown";
      countryMap[p] = (countryMap[p] ?? 0) + 1;
    }
    const byCountryArr = Object.entries(countryMap)
      .map(([pais, count]) => ({ pais, count }))
      .sort((a, b) => b.count - a.count);

    // ── Process top companies ──
    const companyMap: Record<string, { count: number; resolved: number }> = {};
    for (const row of topCompanies.data ?? []) {
      const name = (row.empresa as string).trim();
      if (!name) continue;
      if (!companyMap[name]) companyMap[name] = { count: 0, resolved: 0 };
      companyMap[name].count += 1;
      if (row.status === "resuelto") companyMap[name].resolved += 1;
    }
    const topCompaniesArr = Object.entries(companyMap)
      .map(([empresa, { count, resolved }]) => ({ empresa, count, resolved }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // ── Process daily volume ──
    const dayMap: Record<string, number> = {};
    for (const row of dailyVolume.data ?? []) {
      const day = (row.created_at as string).slice(0, 10);
      dayMap[day] = (dayMap[day] ?? 0) + 1;
    }
    // Fill missing days with 0
    const dailyVolumeArr: Array<{ date: string; count: number }> = [];
    for (let d = 0; d < 30; d++) {
      const date = new Date(Date.now() - (29 - d) * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      dailyVolumeArr.push({ date, count: dayMap[date] ?? 0 });
    }

    // ── Process financial ──
    const montos = (financialData.data ?? [])
      .map((r) => r.monto_reclamo as number)
      .filter((m) => m > 0);
    const scores = (financialData.data ?? [])
      .map((r) => r.probabilidad_exito as number)
      .filter((s) => s !== null && s !== undefined);

    const avg_claim = montos.length > 0
      ? Math.round(montos.reduce((a, b) => a + b, 0) / montos.length)
      : 0;
    const total_claimed = Math.round(montos.reduce((a, b) => a + b, 0));
    const avg_success_score = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0;

    // ── Process feedback ──
    const ratings = (feedbackData.data ?? []).map((r) => r.rating as number);
    const avg_rating = ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : 0;
    const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of ratings) ratingDist[r] = (ratingDist[r] ?? 0) + 1;
    const feedbackDistArr = Object.entries(ratingDist).map(([rating, count]) => ({
      rating: Number(rating),
      count,
    }));

    // ── Compute totals & resolution rate ──
    const totalCases = casesAll.count ?? 0;
    const resolvedCount = statusMap["resuelto"] ?? 0;
    const escalatedCount = statusMap["escalado"] ?? 0;
    const complaintGenerated = statusMap["reclamo_generado"] ?? 0;

    const resolutionRate = totalCases > 0
      ? Math.round((resolvedCount / totalCases) * 100)
      : 0;

    const metrics: AdminMetrics = {
      totals: {
        cases: totalCases,
        cases30d: cases30d.count ?? 0,
        complaints_generated: complaintGenerated,
        resolved: resolvedCount,
        escalated: escalatedCount,
      },
      by_status: byStatusArr,
      by_country: byCountryArr,
      top_companies: topCompaniesArr,
      daily_volume: dailyVolumeArr,
      financial: { avg_claim, total_claimed, avg_success_score },
      feedback: {
        avg_rating,
        total_responses: ratings.length,
        distribution: feedbackDistArr,
      },
      resolution_rate: resolutionRate,
      generated_at: new Date().toISOString(),
    };

    log.info({ userId, totalCases }, "Admin metrics served");

    return NextResponse.json(metrics, {
      headers: { "Cache-Control": "private, max-age=120" }, // 2-min cache
    });
  } catch (err) {
    log.error({ err }, "Admin metrics error");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
