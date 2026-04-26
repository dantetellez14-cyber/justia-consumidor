/**
 * GET /api/stripe/status
 * Returns the current Pro subscription status for the signed-in user.
 * Uses a SECURITY DEFINER RPC to bypass RLS.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ isPro: false });
  }

  const { data, error } = await supabase.rpc("get_user_subscription", {
    p_user_id: userId,
  });

  if (error) {
    console.error("[stripe/status] RPC error:", error.message);
    return NextResponse.json({ isPro: false, plan: "free", status: "inactive", currentPeriodEnd: null });
  }

  // RPC returns an array of rows (RETURNS TABLE); take the first row
  const row = Array.isArray(data) ? (data[0] ?? null) : (data ?? null);
  const isPro = row?.plan === "pro" && row?.status === "active";

  return NextResponse.json({
    isPro,
    plan: row?.plan ?? "free",
    status: row?.status ?? "inactive",
    currentPeriodEnd: row?.current_period_end ?? null,
  });
}
