/**
 * POST /api/empresa/billing/checkout
 * Creates a Stripe Checkout session for empresa B2B plans.
 * Plan: "smb" ($99/mo, 50 cases) or "mid" ($299/mo, 200 cases).
 * Uses hybrid billing: flat base subscription + metered overage item.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  stripe,
  STRIPE_EMPRESA_SMB_BASE,
  STRIPE_EMPRESA_SMB_OVERAGE,
  STRIPE_EMPRESA_MID_BASE,
  STRIPE_EMPRESA_MID_OVERAGE,
} from "@/lib/stripe";
import { getCompanyForUser } from "@/lib/empresa";
import { supabase } from "@/lib/supabase";
import { logError, createRouteLogger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

const log = createRouteLogger("/api/empresa/billing");

const PLAN_CONFIG = {
  smb: {
    basePriceId: STRIPE_EMPRESA_SMB_BASE,
    overagePriceId: STRIPE_EMPRESA_SMB_OVERAGE,
    includedCases: 50,
    basePriceCents: 9900,
    overagePriceCents: 600,
  },
  mid: {
    basePriceId: STRIPE_EMPRESA_MID_BASE,
    overagePriceId: STRIPE_EMPRESA_MID_OVERAGE,
    includedCases: 200,
    basePriceCents: 29900,
    overagePriceCents: 400,
  },
} as const;

const bodySchema = z.object({
  plan: z.enum(["smb", "mid"]),
});

export async function POST(request: NextRequest) {
  log.info({ url: request.url }, "Empresa billing checkout request");
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Debes iniciar sesión primero." }, { status: 401 });
  }

  const { allowed, resetIn } = await rateLimit(`empresa-billing-post:${userId}`, {
    limit: 5,
    windowSeconds: 60,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta de nuevo en ${resetIn} segundos.` },
      { status: 429 }
    );
  }

  const company = await getCompanyForUser(userId);
  if (!company) {
    return NextResponse.json({ error: "No tienes una empresa registrada." }, { status: 403 });
  }

  if (company.role !== "admin") {
    return NextResponse.json({ error: "Solo el administrador puede cambiar el plan." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const planKey = parsed.data.plan;
  const config = PLAN_CONFIG[planKey];

  if (!config.basePriceId || !config.overagePriceId) {
    logError("Missing Stripe empresa price ID env vars", new Error("missing_price_id"), {
      plan: planKey,
    });
    return NextResponse.json(
      { error: "Plan no configurado. Contacta a soporte." },
      { status: 500 }
    );
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? undefined;

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://justia-consumidor.vercel.app";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        { price: config.basePriceId, quantity: 1 },
        { price: config.overagePriceId },
      ],
      customer_email: email,
      metadata: {
        userId,
        companyId: company.account.id,
        plan: planKey,
      },
      success_url: `${origin}/empresa?upgraded=true`,
      cancel_url: `${origin}/empresa`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    logError("Stripe empresa checkout error", err, { route: "/api/empresa/billing", plan: planKey });
    return NextResponse.json({ error: "Error al crear sesión de pago." }, { status: 500 });
  }
}

/**
 * GET /api/empresa/billing — Get current plan + usage for the dashboard.
 */
export async function GET(_request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const company = await getCompanyForUser(userId);
  if (!company) {
    return NextResponse.json({ error: "No tienes una empresa registrada." }, { status: 403 });
  }

  const { data } = await supabase
    .from("empresa_plan_status")
    .select("*")
    .eq("company_id", company.account.id)
    .single();

  return NextResponse.json(data ?? {
    plan: "starter",
    subscription_status: "active",
    included_cases: 5,
    cases_this_month: 0,
    overage_cases: 0,
    overage_price_cents: 0,
    base_price_cents: 0,
  });
}
