import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock Clerk auth
const mockAuth = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}));

// Mock Supabase
const mockSingle = vi.fn();
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    })),
  },
}));

// Mock rate-limit
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 9, resetIn: 60 }),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: "user_123" });
  });

  it("creates feedback with valid rating", async () => {
    const mockFeedback = { id: "fb-uuid", rating: 4, user_id: "user_123" };
    mockSingle.mockResolvedValue({ data: mockFeedback, error: null });

    const { POST } = await import("@/app/api/feedback/route");
    const res = await POST(makeRequest({ rating: 4 }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.rating).toBe(4);
  });

  it("creates feedback with all fields", async () => {
    const input = {
      rating: 5,
      comment: "Excelente servicio",
      case_id: "550e8400-e29b-41d4-a716-446655440000",
    };
    const mockFeedback = { id: "fb-uuid", ...input, user_id: "user_123" };
    mockSingle.mockResolvedValue({ data: mockFeedback, error: null });

    const { POST } = await import("@/app/api/feedback/route");
    const res = await POST(makeRequest(input));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.comment).toBe("Excelente servicio");
  });

  it("returns 400 for missing rating", async () => {
    const { POST } = await import("@/app/api/feedback/route");
    const res = await POST(makeRequest({}));

    expect(res.status).toBe(400);
  });

  it("returns 400 for rating out of range", async () => {
    const { POST } = await import("@/app/api/feedback/route");

    const res1 = await POST(makeRequest({ rating: 0 }));
    expect(res1.status).toBe(400);

    const res2 = await POST(makeRequest({ rating: 6 }));
    expect(res2.status).toBe(400);
  });

  it("returns 400 for non-integer rating", async () => {
    const { POST } = await import("@/app/api/feedback/route");
    const res = await POST(makeRequest({ rating: 3.5 }));

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid case_id UUID", async () => {
    const { POST } = await import("@/app/api/feedback/route");
    const res = await POST(makeRequest({ rating: 4, case_id: "bad-id" }));

    expect(res.status).toBe(400);
  });

  it("returns 400 for malformed JSON", async () => {
    const req = new NextRequest("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{invalid",
    });

    const { POST } = await import("@/app/api/feedback/route");
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("returns 500 on Supabase error", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "DB error" } });

    const { POST } = await import("@/app/api/feedback/route");
    const res = await POST(makeRequest({ rating: 3 }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Error al guardar el feedback.");
  });
});
