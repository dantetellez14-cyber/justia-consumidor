import pino from "pino";
import * as Sentry from "@sentry/nextjs";

/**
 * Structured logger powered by pino.
 *
 * - JSON output in production (machine-parseable for Vercel logs)
 * - Pretty output in development
 * - Errors are automatically forwarded to Sentry
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.info({ userId, caseId }, "Case created");
 *   logger.error({ err, route: "/api/analyze" }, "Ollama API error");
 */

const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug");

export const logger = pino({
  level,
  // Redact sensitive fields from logs
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "secret",
      "token",
      "apiKey",
      // PII fields
      "email",
      "nombre",
      "relato",
    ],
    censor: "[REDACTED]",
  },
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Log an error and forward it to Sentry with optional context.
 *
 * Use this instead of console.error for all server-side errors.
 */
export function logError(
  message: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));

  logger.error(
    {
      err: {
        message: errorObj.message,
        name: errorObj.name,
        stack: errorObj.stack,
      },
      ...context,
    },
    message
  );

  // Forward to Sentry with extra context
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext("extra", context);
    }
    Sentry.captureException(errorObj);
  });
}

/**
 * Create a child logger scoped to a specific route/module.
 *
 *   const log = createRouteLogger("/api/analyze");
 *   log.info({ relato: relato.slice(0, 50) }, "Analysis started");
 */
export function createRouteLogger(route: string) {
  return logger.child({ route });
}
