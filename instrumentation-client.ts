import * as Sentry from "@sentry/nextjs";

if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_MSW_ENABLED === "true"
) {
  import("./e2e/mocks/worker").then(({ worker }) => {
    worker.start({ onUnhandledRequest: "bypass" });
  });
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enableLogs: true,
  integrations: [Sentry.replayIntegration()],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
