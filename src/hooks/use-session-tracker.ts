"use client";

/**
 * useSessionTracker
 * Fires POST /api/analytics/session on mount (start) and unmount (end).
 * Tracks page count and last page visited.
 * Uses sendBeacon on unload so the end ping survives tab closes.
 */

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";

export function useSessionTracker() {
  const { userId, isLoaded } = useAuth();
  const sessionIdRef = useRef<string | null>(null);
  const pagesRef = useRef<number>(1);

  useEffect(() => {
    if (!isLoaded) return;

    // Start session
    async function startSession() {
      try {
        const res = await fetch("/api/analytics/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "start",
            lastPage: window.location.pathname,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          sessionIdRef.current = data.sessionId ?? null;
        }
      } catch {
        // Non-blocking — analytics failure must not affect the user
      }
    }

    void startSession();

    // End session on unload — sendBeacon survives tab/window closes
    function endSession() {
      if (!sessionIdRef.current) return;
      const payload = JSON.stringify({
        action: "end",
        sessionId: sessionIdRef.current,
        pagesVisited: pagesRef.current,
        lastPage: window.location.pathname,
      });
      // sendBeacon is fire-and-forget and survives page unload
      const sent = navigator.sendBeacon(
        "/api/analytics/session",
        new Blob([payload], { type: "application/json" })
      );
      // Fallback for environments where sendBeacon fails
      if (!sent) {
        fetch("/api/analytics/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    }

    window.addEventListener("beforeunload", endSession);
    return () => {
      window.removeEventListener("beforeunload", endSession);
      endSession();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userId]);

  // Call this whenever the user navigates to a new logical "page" within the SPA
  function trackPage() {
    pagesRef.current += 1;
  }

  return { trackPage };
}
