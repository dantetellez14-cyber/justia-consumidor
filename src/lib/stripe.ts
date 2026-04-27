import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
});

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID!;
export const STRIPE_PRICE_ID_MONTHLY = process.env.STRIPE_PRICE_ID_MONTHLY!;

// Empresa B2B plans — hybrid: flat base + metered overage
export const STRIPE_EMPRESA_SMB_BASE     = process.env.STRIPE_EMPRESA_SMB_BASE!;
export const STRIPE_EMPRESA_SMB_OVERAGE  = process.env.STRIPE_EMPRESA_SMB_OVERAGE!;
export const STRIPE_EMPRESA_MID_BASE     = process.env.STRIPE_EMPRESA_MID_BASE!;
export const STRIPE_EMPRESA_MID_OVERAGE  = process.env.STRIPE_EMPRESA_MID_OVERAGE!;
