import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock Clerk auth
const mockAuth = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}));

// Mock Resend — must use class-like constructor
const mockSend = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mockSend };
  },
}));

// Mock rate-limit
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 4, resetIn: 3600 }),
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

// Mock fetch for case status update
vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));

const validComplaint = {
  analysis: {
    empresa: "Telecom",
    producto_servicio: "Internet",
    monto_reclamo: 50000,
    fecha_incidente: "2024-01-15",
    core_grievance: "Cobro indebido",
    probabilidad_exito: 0.75,
    analisis_legal: "Art. 10 bis Ley 24.240",
    pais_detectado: "AR" as const,
  },
  nombre: "Juan Pérez",
  email: "juan@test.com",
  empresaEmail: "reclamos@telecom.com",
  complaintText: "Por medio de la presente solicito el reembolso de los cobros.",
  caseId: null,
};

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/send-complaint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/send-complaint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: "user_123" });
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const { POST } = await import("@/app/api/send-complaint/route");
    const res = await POST(makeRequest(validComplaint));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toContain("sesión");
  });

  it("returns 400 for invalid email", async () => {
    const { POST } = await import("@/app/api/send-complaint/route");
    const res = await POST(
      makeRequest({ ...validComplaint, email: "not-an-email" })
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid empresa email", async () => {
    const { POST } = await import("@/app/api/send-complaint/route");
    const res = await POST(
      makeRequest({ ...validComplaint, empresaEmail: "bad" })
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 for empty nombre", async () => {
    const { POST } = await import("@/app/api/send-complaint/route");
    const res = await POST(
      makeRequest({ ...validComplaint, nombre: "" })
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 for short complaint text", async () => {
    const { POST } = await import("@/app/api/send-complaint/route");
    const res = await POST(
      makeRequest({ ...validComplaint, complaintText: "corto" })
    );

    expect(res.status).toBe(400);
  });

  it("sends complaint successfully", async () => {
    mockSend
      .mockResolvedValueOnce({ error: null }) // complaint email
      .mockResolvedValueOnce({ error: null }); // confirmation email

    const { POST } = await import("@/app/api/send-complaint/route");
    const res = await POST(makeRequest(validComplaint));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.results.complaint).toBe(true);
    expect(data.results.confirmation).toBe(true);
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("returns 500 when Resend fails", async () => {
    mockSend.mockResolvedValueOnce({
      error: { message: "Invalid API key" },
    });

    const { POST } = await import("@/app/api/send-complaint/route");
    const res = await POST(makeRequest(validComplaint));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toContain("Invalid API key");
  });

  it("returns 400 for malformed JSON", async () => {
    const req = new NextRequest("http://localhost:3000/api/send-complaint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const { POST } = await import("@/app/api/send-complaint/route");
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
