/**
 * Rate limiter powered by Upstash Redis (works across all serverless instances).
 *
 * Falls back to in-memory when UPSTASH_REDIS_REST_URL is not configured
 * (local development).
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Result type shared by both backends ──
export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly resetIn: number; // seconds until window resets
}

// ── Upstash Redis rate limiters (shared across all serverless instances) ──
function createRedis(): Redis {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

const limiters = new Map<string, Ratelimit>();

function getUpstashLimiter(
  prefix: string,
  limit: number,
  windowSeconds: number
): Ratelimit {
  const key = `${prefix}:${limit}:${windowSeconds}`;
  const existing = limiters.get(key);
  if (existing) return existing;

  const duration =
    windowSeconds >= 3600
      ? (`${windowSeconds / 3600} h` as const)
      : windowSeconds >= 60
        ? (`${windowSeconds / 60} m` as const)
        : (`${windowSeconds} s` as const);

  const limiter = new Ratelimit({
    redis: createRedis(),
    limiter: Ratelimit.slidingWindow(limit, duration),
    prefix: `ratelimit:${prefix}`,
    analytics: true,
  });

  limiters.set(key, limiter);
  return limiter;
}

// ── In-memory fallback for local dev ──
interface MemoryEntry {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, MemoryEntry>();
let lastCleanup = Date.now();

function memoryRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  if (now - lastCleanup > 60_000) {
    lastCleanup = now;
    for (const [k, entry] of memoryStore) {
      if (now > entry.resetTime) memoryStore.delete(k);
    }
  }

  const windowMs = windowSeconds * 1000;
  const existing = memoryStore.get(key);

  if (!existing || now > existing.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetIn: windowSeconds };
  }

  const newCount = existing.count + 1;
  memoryStore.set(key, { count: newCount, resetTime: existing.resetTime });
  const resetIn = Math.ceil((existing.resetTime - now) / 1000);

  if (newCount > limit) {
    return { allowed: false, remaining: 0, resetIn };
  }

  return { allowed: true, remaining: limit - newCount, resetIn };
}

// ── Public API ──
interface RateLimitConfig {
  /** Max requests allowed in the window */
  readonly limit: number;
  /** Window size in seconds */
  readonly windowSeconds: number;
}

/**
 * Rate-limit a request by key.
 *
 * Uses Upstash Redis in production, in-memory fallback in dev.
 */
export async function rateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Use Upstash when configured, fall back to in-memory on error
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const prefix = key.split(":")[0];
      const limiter = getUpstashLimiter(
        prefix,
        config.limit,
        config.windowSeconds
      );

      const result = await limiter.limit(key);

      return {
        allowed: result.success,
        remaining: result.remaining,
        resetIn: Math.ceil((result.reset - Date.now()) / 1000),
      };
    } catch {
      // Upstash Redis unavailable — fall through to in-memory
      console.warn("[rate-limit] Upstash Redis failed, using in-memory fallback");
    }
  }

  // Fallback: in-memory for local dev or when Upstash is unavailable
  return memoryRateLimit(key, config.limit, config.windowSeconds);
}

/**
 * Extract a rate-limit key from the request.
 * Uses x-forwarded-for (Vercel proxy), falls back to "anonymous".
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "anonymous";
}
