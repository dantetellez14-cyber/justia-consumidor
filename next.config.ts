import path from "path";
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

  // Images: self + Clerk avatars + data URIs + Spline textures
  "img-src 'self' data: blob: https://img.clerk.com https://*.clerk.accounts.dev https://prod.spline.design",

  // Fonts: self + Google Fonts (if used)
  "font-src 'self' data:",

  // API connections: self + Supabase + Clerk + PostHog + Sentry + Pinecone + Spline
  "connect-src 'self' https://*.supabase.co https://*.clerk.accounts.dev https://api.clerk.com https://us.i.posthog.com https://*.ingest.us.sentry.io https://*.pinecone.io https://accepted-newt-92323.upstash.io https://prod.spline.design",

  // Frames: Clerk CAPTCHA + Cloudflare challenges
  "frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com",

  // Workers: self + blob (PostHog, Sentry replay, Spline WebGL)
  "worker-src 'self' blob: https://prod.spline.design",

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

const isDev = process.env.NODE_ENV === "development";

// In dev: omit X-Frame-Options so preview/embedded browser tools can load the app
const routeHeaders = isDev
  ? securityHeaders.filter((h) => h.key !== "X-Frame-Options")
  : securityHeaders;

const getHeaderRules = () => [
  { source: "/(.*)", headers: routeHeaders },
  {
    source: "/sw.js",
    headers: [
      { key: "Service-Worker-Allowed", value: "/" },
      { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
      { key: "Content-Type", value: "application/javascript; charset=utf-8" },
    ],
  },
];

const nextConfig: NextConfig = {
  // Fix workspace root detection when there is a lockfile in a parent directory
  outputFileTracingRoot: path.resolve(__dirname),
  headers: getHeaderRules,
};

export default withSentryConfig(nextConfig, {
  // Proxy Sentry requests through the app to avoid ad-blockers
  tunnelRoute: "/monitoring",
  // Suppress logs during build
  silent: !process.env.CI,
  // Upload source maps only when SENTRY_AUTH_TOKEN is available (production / Vercel CI).
  // Local dev builds without the token will skip upload automatically.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
