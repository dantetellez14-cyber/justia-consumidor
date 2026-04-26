/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout session for JustIA Pro ($10/year).
 * Requires the user to be signed in via Clerk.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe, STRIPE_PRICE_ID, STRIPE_PRICE_ID_MONTHLY } from "@/lib/stripe";
import { logError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Debes iniciar sesión primero." }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? undefined;

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://justia-consumidor.vercel.app";

  let plan: "monthly" | "annual" = "annual";
  try {
    const body = await request.json();
    if (body?.plan === "monthly") plan = "monthly";
  } catch {
    // no body or invalid JSON — default to annual
  }

  const priceId = plan === "monthly" ? STRIPE_PRICE_ID_MONTHLY : STRIPE_PRICE_ID;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      metadata: { userId },
      success_url: `${origin}/pro/success`,
      cancel_url: `${origin}/`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    logError("Stripe checkout error", err, { route: "/api/stripe/checkout" });
    return NextResponse.json({ error: "Error al crear sesión de pago." }, { status: 500 });
  }
}
