"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { initPostHog, posthog } from "@/lib/posthog";

export function PostHogProvider({ children }: { readonly children: React.ReactNode }) {
  const { userId } = useAuth();

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

  return <>{children}</>;
}
