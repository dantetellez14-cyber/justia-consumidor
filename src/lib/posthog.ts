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
 * Initialize PostHog only if the user has accepted cookies.
 * Called on consent acceptance or on page load if consent was previously given.
 */
export function initPostHog() {
  if (
    typeof window === "undefined" ||
    !process.env.NEXT_PUBLIC_POSTHOG_KEY
  ) {
    return;
  }

  const consent = getStoredConsent();
  if (consent !== "accepted") return;

  if (posthog.__loaded) return; // already initialized

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
  });
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
