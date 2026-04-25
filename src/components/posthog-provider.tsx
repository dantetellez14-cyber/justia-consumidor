"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { initPostHog, posthog, getStoredConsent } from "@/lib/posthog";
import { CookieConsentBanner } from "./cookie-consent-banner";

export function PostHogProvider({ children }: { readonly children: React.ReactNode }) {
  const { userId } = useAuth();
  const [consentGiven, setConsentGiven] = useState(() => {
    if (typeof window === "undefined") return false;
    return getStoredConsent() === "accepted";
  });

  // Initialize PostHog immediately on mount (opt-out model)
  useEffect(() => {
    initPostHog();
  }, []);

  // Identify user when signed in
  useEffect(() => {
    if (userId) {
      posthog.identify(userId);
    } else {
      posthog.reset();
    }
  }, [userId]);

  const handleConsent = (accepted: boolean) => {
    setConsentGiven(accepted);
    if (!accepted) {
      // User rejected — opt out and clear data
      posthog.opt_out_capturing();
      posthog.reset();
    } else {
      posthog.opt_in_capturing();
    }
  };

  return (
    <>
      {children}
      <CookieConsentBanner onConsent={handleConsent} />
    </>
  );
}
