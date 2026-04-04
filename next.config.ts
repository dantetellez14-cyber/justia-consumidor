import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  // Proxy Sentry requests through the app to avoid ad-blockers
  tunnelRoute: "/monitoring",
  // Suppress logs during build
  silent: !process.env.CI,
  // Skip source map upload (no auth token needed for basic setup)
  sourcemaps: {
    disable: true,
  },
});
