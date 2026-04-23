import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock rate-limit
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 14, resetIn: 60 }),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
  createRouteLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock Pinecone
vi.mock("@/lib/pinecone", () => ({
  getPinecone: vi.fn(),
  PINECONE_INDEX_NAME: "justia-jurisprudencia",
}));

function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/search-jurisprudencia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/search-jurisprudencia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  });

  it("returns 400 for missing query", async () => {
    const { POST } = await import("@/app/api/search-jurisprudencia/route");
    const res = await POST(makeRequest({}));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it("returns 400 for empty query", async () => {
    const { POST } = await import("@/app/api/search-jurisprudencia/route");
    const res = await POST(makeRequest({ query: "" }));

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid pais", async () => {
    const { POST } = await import("@/app/api/search-jurisprudencia/route");
    const res = await POST(makeRequest({ query: "test query", pais: "US" }));

    expect(res.status).toBe(400);
  });

  it("returns static fallback when PINECONE_API_KEY missing", async () => {
    vi.stubEnv("PINECONE_API_KEY", "");

    const { POST } = await import("@/app/api/search-jurisprudencia/route");
    const res = await POST(makeRequest({ query: "garantía electrodoméstico" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.source).toBe("static");
    expect(data.cases).toEqual([]);
  });

  it("accepts valid query with AR pais", async () => {
    vi.stubEnv("PINECONE_API_KEY", "");

    const { POST } = await import("@/app/api/search-jurisprudencia/route");
    const res = await POST(
      makeRequest({ query: "defecto de fábrica en electrodoméstico", pais: "AR" })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.source).toBe("static");
  });

  it("returns 400 for malformed JSON body", async () => {
    const req = new Request("http://localhost:3000/api/search-jurisprudencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const { POST } = await import("@/app/api/search-jurisprudencia/route");
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
