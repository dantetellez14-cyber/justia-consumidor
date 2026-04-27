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
        const companyId = session.metadata?.companyId;
        const empresaPlan = session.metadata?.plan as "smb" | "mid" | undefined;

        log.info({ userId, companyId, plan: empresaPlan, subscription: session.subscription }, "checkout.session.completed");

        if (!session.subscription) {
          log.warn({ userId, companyId }, "Missing subscription — skipping");
          break;
        }

        // Empresa B2B subscription
        if (companyId && empresaPlan) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await upsertEmpresaSubscriptionFromStripe(companyId, empresaPlan, sub, session.customer as string);
          log.info({ companyId, plan: empresaPlan }, "Empresa subscription activated");
          break;
        }

        if (!userId) {
          log.warn({ userId, companyId }, "Missing userId — skipping");
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
        const empresaCompanyId = await getCompanyIdByCustomer(sub.customer as string);

        if (empresaCompanyId) {
          const planMeta = sub.metadata?.plan as "smb" | "mid" | undefined;
          await syncEmpresaSubscription(empresaCompanyId, planMeta, sub);
          log.info({ companyId: empresaCompanyId, status: sub.status }, "Empresa subscription updated");
          break;
        }

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
        const empresaCompanyId = await getCompanyIdByCustomer(sub.customer as string);

        if (empresaCompanyId) {
          await supabase.rpc("upsert_empresa_subscription", {
            p_company_id: empresaCompanyId,
            p_stripe_customer_id: sub.customer as string,
            p_stripe_subscription_id: sub.id,
            p_stripe_base_item_id: null,
            p_stripe_overage_item_id: null,
            p_plan: "starter",
            p_status: "canceled",
            p_included_cases: 5,
            p_overage_price_cents: 0,
            p_base_price_cents: 0,
            p_current_period_start: null,
            p_current_period_end: null,
            p_cancel_at_period_end: false,
          });
          log.info({ companyId: empresaCompanyId }, "Empresa subscription canceled — reverted to starter");
          break;
        }

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
  const { error } = await supabase.rpc("upsert_user_subscription", {
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

// ── Empresa B2B helpers ──────────────────────────────────────────────────────

const EMPRESA_PLAN_CONFIG = {
  smb: { includedCases: 50, basePriceCents: 9900, overagePriceCents: 600 },
  mid: { includedCases: 200, basePriceCents: 29900, overagePriceCents: 400 },
} as const;

function findItemByPriceId(sub: Stripe.Subscription, priceId: string | undefined): string | null {
  if (!priceId) return null;
  return sub.items.data.find((i) => i.price.id === priceId)?.id ?? null;
}

async function upsertEmpresaSubscriptionFromStripe(
  companyId: string,
  plan: "smb" | "mid",
  sub: Stripe.Subscription,
  customerId: string
): Promise<void> {
  const cfg = EMPRESA_PLAN_CONFIG[plan];
  const baseItemId = findItemByPriceId(sub, process.env.STRIPE_EMPRESA_SMB_BASE)
    ?? findItemByPriceId(sub, process.env.STRIPE_EMPRESA_MID_BASE);
  const overageItemId = findItemByPriceId(sub, process.env.STRIPE_EMPRESA_SMB_OVERAGE)
    ?? findItemByPriceId(sub, process.env.STRIPE_EMPRESA_MID_OVERAGE);
  const rawEnd = sub.items.data[0]?.current_period_end ?? null;
  const rawStart = sub.items.data[0]?.current_period_start ?? null;

  const { error } = await supabase.rpc("upsert_empresa_subscription", {
    p_company_id: companyId,
    p_stripe_customer_id: customerId,
    p_stripe_subscription_id: sub.id,
    p_stripe_base_item_id: baseItemId,
    p_stripe_overage_item_id: overageItemId,
    p_plan: plan,
    p_status: sub.status,
    p_included_cases: cfg.includedCases,
    p_overage_price_cents: cfg.overagePriceCents,
    p_base_price_cents: cfg.basePriceCents,
    p_current_period_start: rawStart ? new Date(rawStart * 1000).toISOString() : null,
    p_current_period_end: rawEnd ? new Date(rawEnd * 1000).toISOString() : null,
    p_cancel_at_period_end: sub.cancel_at_period_end ?? false,
  });

  if (error) {
    logError("upsert_empresa_subscription RPC error", error, { companyId, plan });
    throw new Error(`Empresa RPC upsert failed: ${error.message}`);
  }
}

async function syncEmpresaSubscription(
  companyId: string,
  plan: "smb" | "mid" | undefined,
  sub: Stripe.Subscription
): Promise<void> {
  if (!plan) {
    log.warn({ companyId, subId: sub.id }, "Empresa subscription updated without plan metadata — skipping");
    return;
  }
  await upsertEmpresaSubscriptionFromStripe(companyId, plan, sub, sub.customer as string);
}

async function getCompanyIdByCustomer(customerId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_company_id_by_stripe_customer", {
    p_customer_id: customerId,
  });
  if (error) {
    logError("get_company_id_by_stripe_customer RPC error", error, { customerId });
    return null;
  }
  return (data as string | null) ?? null;
}
