"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { initPostHog, posthog, getStoredConsent } from "@/lib/posthog";
import { CookieConsentBanner } from "./cookie-consent-banner";

export function PostHogProvider({ children }: { readonly children: React.ReactNode }) {
  const { userId } = useAuth();
  const [consentGiven, setConsentGiven] = useState(false);

  // Initialize PostHog only after consent
  useEffect(() => {
    const stored = getStoredConsent();
    if (stored === "accepted") {
      setConsentGiven(true);
      initPostHog();
    }
  }, []);

  // Identify user when signed in and consent given
  useEffect(() => {
    if (!consentGiven) return;
    if (userId) {
      posthog.identify(userId);
    } else {
      posthog.reset();
    }
  }, [userId, consentGiven]);

  const handleConsent = (accepted: boolean) => {
    if (accepted) {
      setConsentGiven(true);
      initPostHog();
    }
  };

  return (
    <>
      {children}
      <CookieConsentBanner onConsent={handleConsent} />
    </>
  );
}
