import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(),
}));

import { cacheGet, cacheSet, cacheInvalidate, cached } from "@/lib/cache";

// Tests use in-memory fallback since UPSTASH_REDIS_REST_URL is not set

describe("cache (in-memory fallback)", () => {
  beforeEach(() => {
    // Clear module-level memory cache between tests by invalidating known keys
  });

  it("returns null for missing keys", async () => {
    const result = await cacheGet("nonexistent-key-12345");
    expect(result).toBeNull();
  });

  it("stores and retrieves a value", async () => {
    await cacheSet("test-store", { name: "telmex", score: 7.5 }, 60);
    const result = await cacheGet<{ name: string; score: number }>("test-store");
    expect(result).toEqual({ name: "telmex", score: 7.5 });
  });

  it("invalidates a cached key", async () => {
    await cacheSet("test-invalidate", "hello", 60);
    await cacheInvalidate("test-invalidate");
    const result = await cacheGet("test-invalidate");
    expect(result).toBeNull();
  });

  it("expires entries after TTL", async () => {
    vi.useFakeTimers();
    await cacheSet("test-ttl", "value", 2); // 2 second TTL

    const before = await cacheGet("test-ttl");
    expect(before).toBe("value");

    vi.advanceTimersByTime(3000); // advance past TTL

    const after = await cacheGet("test-ttl");
    expect(after).toBeNull();

    vi.useRealTimers();
  });

  it("cached() returns cached value on second call", async () => {
    let callCount = 0;
    const factory = async () => {
      callCount++;
      return { data: "expensive" };
    };

    const first = await cached("test-cached-fn", 60, factory);
    const second = await cached("test-cached-fn", 60, factory);

    expect(first).toEqual({ data: "expensive" });
    expect(second).toEqual({ data: "expensive" });
    expect(callCount).toBe(1); // factory only called once
  });

  it("cached() calls factory again after invalidation", async () => {
    let callCount = 0;
    const factory = async () => {
      callCount++;
      return { count: callCount };
    };

    await cached("test-reinvoke", 60, factory);
    await cacheInvalidate("test-reinvoke");
    const result = await cached("test-reinvoke", 60, factory);

    expect(result).toEqual({ count: 2 });
    expect(callCount).toBe(2);
  });

  it("handles complex nested objects", async () => {
    const complex = {
      company: { name: "BBVA", sector: "Financiero" },
      stats: [1, 2, 3],
      nested: { deep: { value: true } },
    };

    await cacheSet("test-complex", complex, 60);
    const result = await cacheGet("test-complex");
    expect(result).toEqual(complex);
  });
});
