import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// ── Content Security Policy ──
// Allowlist of all external services used by the app
const cspDirectives = [
  // Default: block everything not explicitly allowed
  "default-src 'self'",

  // Scripts: self + Clerk + PostHog + Sentry (inline needed for Next.js)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://challenges.cloudflare.com https://us.i.posthog.com https://us-assets.i.posthog.com https://browser.sentry-cdn.com",

  // Styles: self + inline (Tailwind, Clerk components)
  "style-src 'self' 'unsafe-inline'",

  // Images: self + Clerk avatars + data URIs
  "img-src 'self' data: blob: https://img.clerk.com https://*.clerk.accounts.dev",

  // Fonts: self + Google Fonts (if used)
  "font-src 'self' data:",

  // API connections: self + Supabase + Clerk + PostHog + Sentry + Pinecone
  "connect-src 'self' https://*.supabase.co https://*.clerk.accounts.dev https://api.clerk.com https://us.i.posthog.com https://*.ingest.us.sentry.io https://*.pinecone.io https://accepted-newt-92323.upstash.io",

  // Frames: Clerk CAPTCHA + Cloudflare challenges
  "frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com",

  // Workers: self + blob (PostHog, Sentry replay)
  "worker-src 'self' blob:",

  // Object/media: none (no Flash, no plugins)
  "object-src 'none'",

  // Base URI: only self (prevent base tag hijacking)
  "base-uri 'self'",

  // Form actions: self + Clerk
  "form-action 'self' https://*.clerk.accounts.dev",
];

const cspHeader = cspDirectives.join("; ");

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: cspHeader,
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Service worker: allow it to control the full origin scope
        source: "/sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
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
