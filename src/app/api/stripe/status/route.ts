/**
 * GET /api/stripe/status
 * Returns the current Pro subscription status for the signed-in user.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ isPro: false });
  }

  const { data } = await supabase
    .from("user_subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", userId)
    .single();

  const isPro = data?.plan === "pro" && data?.status === "active";

  return NextResponse.json({
    isPro,
    plan: data?.plan ?? "free",
    status: data?.status ?? "inactive",
    currentPeriodEnd: data?.current_period_end ?? null,
  });
}
