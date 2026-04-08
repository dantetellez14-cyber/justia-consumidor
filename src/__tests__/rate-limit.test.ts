import { describe, it, expect, beforeEach, vi } from "vitest";

// Force in-memory mode by ensuring no Upstash env vars
beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
});

// Dynamic import to pick up env stubs
async function getRateLimit() {
  // Reset module cache so env stubs take effect
  const mod = await import("@/lib/rate-limit");
  return mod;
}

describe("rateLimit (in-memory fallback)", () => {
  it("allows requests within the limit", async () => {
    const { rateLimit } = await getRateLimit();
    const result = await rateLimit("test-allow:127.0.0.1", {
      limit: 5,
      windowSeconds: 60,
    });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks requests exceeding the limit", async () => {
    const { rateLimit } = await getRateLimit();
    const key = `test-block-${Date.now()}:127.0.0.1`;

    // Exhaust the limit
    for (let i = 0; i < 3; i++) {
      await rateLimit(key, { limit: 3, windowSeconds: 60 });
    }

    // Next request should be blocked
    const result = await rateLimit(key, { limit: 3, windowSeconds: 60 });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks remaining correctly", async () => {
    const { rateLimit } = await getRateLimit();
    const key = `test-remaining-${Date.now()}:127.0.0.1`;

    const r1 = await rateLimit(key, { limit: 3, windowSeconds: 60 });
    expect(r1.remaining).toBe(2);

    const r2 = await rateLimit(key, { limit: 3, windowSeconds: 60 });
    expect(r2.remaining).toBe(1);

    const r3 = await rateLimit(key, { limit: 3, windowSeconds: 60 });
    expect(r3.remaining).toBe(0);
  });

  it("returns resetIn > 0", async () => {
    const { rateLimit } = await getRateLimit();
    const result = await rateLimit(`test-reset-${Date.now()}:127.0.0.1`, {
      limit: 5,
      windowSeconds: 60,
    });
    expect(result.resetIn).toBeGreaterThan(0);
    expect(result.resetIn).toBeLessThanOrEqual(60);
  });

  it("uses different counters for different keys", async () => {
    const { rateLimit } = await getRateLimit();
    const ts = Date.now();

    const r1 = await rateLimit(`test-key-a-${ts}:1.1.1.1`, {
      limit: 2,
      windowSeconds: 60,
    });
    const r2 = await rateLimit(`test-key-b-${ts}:1.1.1.1`, {
      limit: 2,
      windowSeconds: 60,
    });

    expect(r1.remaining).toBe(1);
    expect(r2.remaining).toBe(1);
  });
});

describe("rateLimit edge cases", () => {
  it("allows requests again after window expires (short window)", async () => {
    const { rateLimit } = await getRateLimit();
    const key = `test-expire-${Date.now()}:127.0.0.1`;

    // Use a 1-second window
    await rateLimit(key, { limit: 1, windowSeconds: 1 });

    // Should be blocked immediately
    const blocked = await rateLimit(key, { limit: 1, windowSeconds: 1 });
    expect(blocked.allowed).toBe(false);

    // Wait for window to expire
    await new Promise((r) => setTimeout(r, 1100));

    // Should be allowed again
    const allowed = await rateLimit(key, { limit: 1, windowSeconds: 1 });
    expect(allowed.allowed).toBe(true);
    expect(allowed.remaining).toBe(0);
  });

  it("handles limit of 1 correctly", async () => {
    const { rateLimit } = await getRateLimit();
    const key = `test-limit1-${Date.now()}:127.0.0.1`;

    const first = await rateLimit(key, { limit: 1, windowSeconds: 60 });
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(0);

    const second = await rateLimit(key, { limit: 1, windowSeconds: 60 });
    expect(second.allowed).toBe(false);
  });

  it("handles high limit correctly", async () => {
    const { rateLimit } = await getRateLimit();
    const key = `test-high-${Date.now()}:127.0.0.1`;

    const result = await rateLimit(key, { limit: 1000, windowSeconds: 60 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(999);
  });
});

describe("getClientIp", () => {
  it("extracts IP from x-forwarded-for header", async () => {
    const { getClientIp } = await getRateLimit();
    const request = new Request("http://localhost/api/test", {
      headers: { "x-forwarded-for": "203.0.113.50, 70.41.3.18" },
    });
    expect(getClientIp(request)).toBe("203.0.113.50");
  });

  it("returns anonymous when no forwarded header", async () => {
    const { getClientIp } = await getRateLimit();
    const request = new Request("http://localhost/api/test");
    expect(getClientIp(request)).toBe("anonymous");
  });

  it("trims whitespace from IP", async () => {
    const { getClientIp } = await getRateLimit();
    const request = new Request("http://localhost/api/test", {
      headers: { "x-forwarded-for": "  10.0.0.1  , 192.168.1.1" },
    });
    expect(getClientIp(request)).toBe("10.0.0.1");
  });
});
