/**
 * Server-side caching layer powered by Upstash Redis.
 *
 * Uses Redis GET/SET with TTL for caching expensive queries
 * (complaint stats, jurisprudencia search). Falls back to
 * in-memory Map when Redis is unavailable (local dev).
 */

import { Redis } from "@upstash/redis";

// ── Redis singleton ──

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

// ── In-memory fallback ──

interface MemoryCacheEntry {
  value: string;
  expiresAt: number;
}

const memoryCache = new Map<string, MemoryCacheEntry>();

function memoryGet(key: string): string | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

function memorySet(key: string, value: string, ttlSeconds: number): void {
  // Cap in-memory cache at 500 entries to prevent unbounded growth
  if (memoryCache.size > 500) {
    const now = Date.now();
    for (const [k, entry] of memoryCache) {
      if (now > entry.expiresAt) memoryCache.delete(k);
    }
    // If still over limit after purging expired, drop oldest
    if (memoryCache.size > 500) {
      const firstKey = memoryCache.keys().next().value;
      if (firstKey) memoryCache.delete(firstKey);
    }
  }

  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

// ── Public API ──

const CACHE_PREFIX = "cache:";

/**
 * Get a cached value by key.
 * Returns null if not found or expired.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const fullKey = `${CACHE_PREFIX}${key}`;

  const client = getRedis();
  if (client) {
    try {
      const raw = await client.get<string>(fullKey);
      if (raw === null) return null;
      return JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw)) as T;
    } catch {
      // Redis failure — try memory fallback
    }
  }

  const memVal = memoryGet(fullKey);
  return memVal ? (JSON.parse(memVal) as T) : null;
}

/**
 * Set a cached value with TTL in seconds.
 */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  const fullKey = `${CACHE_PREFIX}${key}`;
  const serialized = JSON.stringify(value);

  const client = getRedis();
  if (client) {
    try {
      await client.set(fullKey, serialized, { ex: ttlSeconds });
      return;
    } catch {
      // Redis failure — fall through to memory
    }
  }

  memorySet(fullKey, serialized, ttlSeconds);
}

/**
 * Invalidate a cached key.
 */
export async function cacheInvalidate(key: string): Promise<void> {
  const fullKey = `${CACHE_PREFIX}${key}`;

  const client = getRedis();
  if (client) {
    try {
      await client.del(fullKey);
    } catch {
      // ignore
    }
  }

  memoryCache.delete(fullKey);
}

/**
 * Cache-through helper: returns cached value if available,
 * otherwise calls the factory function, caches the result, and returns it.
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  factory: () => Promise<T>
): Promise<T> {
  const existing = await cacheGet<T>(key);
  if (existing !== null) return existing;

  const result = await factory();
  await cacheSet(key, result, ttlSeconds);
  return result;
}
