import posthog from "posthog-js";

const CONSENT_KEY = "justia_cookie_consent";

export type CookieConsent = "accepted" | "rejected" | null;

export function getStoredConsent(): CookieConsent {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === "accepted" || value === "rejected") return value;
  return null;
}

export function setStoredConsent(consent: "accepted" | "rejected"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, consent);
}

/**
 * Initialize PostHog immediately (opt-out model).
 * Starts capturing anonymized analytics by default.
 * If the user previously rejected cookies, opts out right away.
 */
export function initPostHog() {
  if (
    typeof window === "undefined" ||
    !process.env.NEXT_PUBLIC_POSTHOG_KEY
  ) {
    return;
  }

  if (posthog.__loaded) return; // already initialized

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    opt_out_capturing_by_default: false,
  });

  // If user previously rejected cookies, honor that immediately
  const consent = getStoredConsent();
  if (consent === "rejected") {
    posthog.opt_out_capturing();
  }
}

/**
 * Opt out of PostHog tracking and clear stored data.
 */
export function optOutPostHog() {
  if (typeof window === "undefined") return;
  if (posthog.__loaded) {
    posthog.opt_out_capturing();
    posthog.reset();
  }
}

export { posthog };
