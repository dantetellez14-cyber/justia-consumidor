/**
 * POST /api/stripe/webhook
 * Handles Stripe events to keep user_subscriptions in sync.
 *
 * Events handled:
 * - checkout.session.completed   → activate Pro
 * - customer.subscription.updated → sync status
 * - customer.subscription.deleted → cancel Pro
 *
 * Uses SECURITY DEFINER RPCs to bypass RLS regardless of which
 * Supabase key format (JWT or sb_secret_...) is configured.
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
    log.warn({}, "Missing stripe-signature or webhook secret");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    logError("Stripe webhook signature error", err, { route: "/api/stripe/webhook" });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  log.info({ eventType: event.type, eventId: event.id }, "Webhook received");

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        log.info({ userId, subscription: session.subscription }, "checkout.session.completed");

        if (!userId || !session.subscription) {
          log.warn({ userId, subscription: session.subscription }, "Missing userId or subscription — skipping");
          break;
        }

        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const rawEnd = sub.items.data[0]?.current_period_end ?? null;
        const periodEnd = rawEnd ? new Date(rawEnd * 1000).toISOString() : null;

        await upsertSubscription({
          userId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: sub.id,
          stripePriceId: sub.items.data[0]?.price.id ?? null,
          status: "active",
          plan: "pro",
          currentPeriodEnd: periodEnd,
        });

        log.info({ userId }, "Pro subscription activated");
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await getUserIdByCustomer(sub.customer as string);

        log.info({ customerId: sub.customer, userId, status: sub.status }, "customer.subscription.updated");

        if (!userId) {
          log.warn({ customerId: sub.customer }, "No userId found for customer — skipping");
          break;
        }

        const isActive = sub.status === "active";
        const rawEnd2 = sub.items.data[0]?.current_period_end ?? null;
        const periodEnd = rawEnd2 ? new Date(rawEnd2 * 1000).toISOString() : null;

        await upsertSubscription({
          userId,
          stripeSubscriptionId: sub.id,
          stripePriceId: sub.items.data[0]?.price.id ?? null,
          status: sub.status as "active" | "inactive" | "canceled" | "past_due",
          plan: isActive ? "pro" : "free",
          currentPeriodEnd: periodEnd,
        });

        log.info({ userId, status: sub.status }, "Subscription updated");
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await getUserIdByCustomer(sub.customer as string);

        log.info({ customerId: sub.customer, userId }, "customer.subscription.deleted");

        if (!userId) {
          log.warn({ customerId: sub.customer }, "No userId found for customer — skipping");
          break;
        }

        await upsertSubscription({
          userId,
          status: "canceled",
          plan: "free",
          currentPeriodEnd: null,
        });

        log.info({ userId }, "Subscription canceled");
        break;
      }

      default:
        log.info({ eventType: event.type }, "Unhandled event type — ignoring");
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

interface UpsertParams {
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string | null;
  status?: "active" | "inactive" | "canceled" | "past_due";
  plan?: "free" | "pro";
  currentPeriodEnd?: string | null;
}

/**
 * Calls the SECURITY DEFINER RPC to upsert subscription data.
 * This bypasses RLS regardless of the supabase client key format.
 */
async function upsertSubscription(params: UpsertParams): Promise<void> {
  const { data, error } = await supabase.rpc("upsert_user_subscription", {
    p_user_id: params.userId,
    p_stripe_customer_id: params.stripeCustomerId ?? null,
    p_stripe_subscription_id: params.stripeSubscriptionId ?? null,
    p_stripe_price_id: params.stripePriceId ?? null,
    p_status: params.status ?? null,
    p_plan: params.plan ?? null,
    p_current_period_end: params.currentPeriodEnd ?? null,
  });

  if (error) {
    logError("upsert_user_subscription RPC error", error, { params });
    throw new Error(`RPC upsert failed: ${error.message}`);
  }

  log.info({ userId: params.userId, plan: params.plan }, "Subscription upserted via RPC");
}

/**
 * Calls the SECURITY DEFINER RPC to look up user_id by Stripe customer ID.
 */
async function getUserIdByCustomer(customerId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_user_id_by_customer", {
    p_customer_id: customerId,
  });

  if (error) {
    logError("get_user_id_by_customer RPC error", error, { customerId });
    return null;
  }

  return (data as string | null) ?? null;
}
