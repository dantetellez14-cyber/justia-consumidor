import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  _stripe = new Stripe(key, {
    apiVersion: "2026-04-22.dahlia",
  });
  return _stripe;
}

// Lazy proxy: validation deferred until first property access at runtime,
// so importing this module during `next build` (page data collection) does
// not require the secret key to be present.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop as string | symbol];
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(client) : value;
  },
});

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID ?? "";
export const STRIPE_PRICE_ID_MONTHLY = process.env.STRIPE_PRICE_ID_MONTHLY ?? "";

export const STRIPE_EMPRESA_SMB_BASE = process.env.STRIPE_EMPRESA_SMB_BASE ?? "";
export const STRIPE_EMPRESA_SMB_OVERAGE = process.env.STRIPE_EMPRESA_SMB_OVERAGE ?? "";
export const STRIPE_EMPRESA_MID_BASE = process.env.STRIPE_EMPRESA_MID_BASE ?? "";
export const STRIPE_EMPRESA_MID_OVERAGE = process.env.STRIPE_EMPRESA_MID_OVERAGE ?? "";
