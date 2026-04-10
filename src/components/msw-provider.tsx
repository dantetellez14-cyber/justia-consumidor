"use client";

import { useEffect } from "react";

export function MswProvider() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MSW_ENABLED === "true") {
      import("@/lib/msw-init").then(({ initMSW }) => initMSW());
    }
  }, []);

  return null;
}
