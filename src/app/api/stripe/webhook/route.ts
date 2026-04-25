/**
 * POST /api/stripe/webhook
 * Handles Stripe events to keep user_subscriptions in sync.
 *
 * Events handled:
 * - checkout.session.completed   → activate Pro
 * - customer.subscription.updated → sync status
 * - customer.subscription.deleted → cancel Pro
 */

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { logError, createRouteLogger } from "@/lib/logger";
import type Stripe from "stripe";

const log = createRouteLogger("/api/stripe/webhook");

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    logError("Stripe webhook signature error", err, { route: "/api/stripe/webhook" });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId || !session.subscription) break;

        const sub = await stripe.subscriptions.retrieve(session.subscription as string);

        await upsertSubscription(userId, {
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: sub.id,
          stripe_price_id: sub.items.data[0]?.price.id ?? null,
          status: "active",
          plan: "pro",
          current_period_end: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
        });

        log.info({ userId }, "Pro subscription activated");
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await getUserIdByCustomer(sub.customer as string);
        if (!userId) break;

        const isActive = sub.status === "active";
        await upsertSubscription(userId, {
          stripe_subscription_id: sub.id,
          stripe_price_id: sub.items.data[0]?.price.id ?? null,
          status: sub.status as "active" | "inactive" | "canceled" | "past_due",
          plan: isActive ? "pro" : "free",
          current_period_end: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
        });

        log.info({ userId, status: sub.status }, "Subscription updated");
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await getUserIdByCustomer(sub.customer as string);
        if (!userId) break;

        await upsertSubscription(userId, {
          status: "canceled",
          plan: "free",
          current_period_end: null,
        });

        log.info({ userId }, "Subscription canceled");
        break;
      }
    }
  } catch (err) {
    logError("Stripe webhook handler error", err, {
      route: "/api/stripe/webhook",
      eventType: event.type,
    });
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(
  userId: string,
  data: Partial<{
    stripe_customer_id: string;
    stripe_subscription_id: string;
    stripe_price_id: string | null;
    status: "active" | "inactive" | "canceled" | "past_due";
    plan: "free" | "pro";
    current_period_end: string | null;
  }>
) {
  const { error } = await supabase
    .from("user_subscriptions")
    .upsert({ user_id: userId, ...data }, { onConflict: "user_id" });

  if (error) {
    logError("Supabase upsert subscription error", error, { userId });
  }
}

async function getUserIdByCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabase
    .from("user_subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single();
  return data?.user_id ?? null;
}
