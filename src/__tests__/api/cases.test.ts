import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock Clerk auth
const mockAuth = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}));

// Mock Supabase with proper chaining
const mockSingleResult = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      insert: () => ({
        select: () => ({
          single: () => mockSingleResult(),
        }),
      }),
      select: () => ({
        eq: () => ({
          single: () => mockSingleResult(),
          order: () => mockSingleResult(),
        }),
        order: () => mockSingleResult(),
      }),
    }),
  },
}));

// Mock rate-limit
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 19, resetIn: 60 }),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

const validCase = {
  relato: "Mi reclamo completo",
  empresa: "Telecom",
  producto_servicio: "Internet",
  monto_reclamo: 50000,
  fecha_incidente: "2024-01-15",
  core_grievance: "Cobro indebido",
  probabilidad_exito: 0.75,
  analisis_legal: "Art. 10 bis Ley 24.240",
  pais_detectado: "AR",
};

function makePostRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/cases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(params?: Record<string, string>): NextRequest {
  const url = new URL("http://localhost:3000/api/cases");
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new NextRequest(url);
}

describe("POST /api/cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: "user_123" });
  });

  it("creates a case with valid data", async () => {
    const mockCase = { id: "case-uuid", ...validCase, status: "consulta_recibida", user_id: "user_123" };
    mockSingleResult.mockResolvedValue({ data: mockCase, error: null });

    const { POST } = await import("@/app/api/cases/route");
    const res = await POST(makePostRequest(validCase));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe("case-uuid");
    expect(data.status).toBe("consulta_recibida");
  });

  it("returns 400 for invalid data", async () => {
    const { POST } = await import("@/app/api/cases/route");
    const res = await POST(makePostRequest({ relato: "solo esto" }));

    expect(res.status).toBe(400);
  });

  it("returns 400 for negative monto", async () => {
    const { POST } = await import("@/app/api/cases/route");
    const res = await POST(makePostRequest({ ...validCase, monto_reclamo: -100 }));

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid pais", async () => {
    const { POST } = await import("@/app/api/cases/route");
    const res = await POST(makePostRequest({ ...validCase, pais_detectado: "US" }));

    expect(res.status).toBe(400);
  });

  it("returns 500 on Supabase error", async () => {
    mockSingleResult.mockResolvedValue({ data: null, error: { message: "DB error" } });

    const { POST } = await import("@/app/api/cases/route");
    const res = await POST(makePostRequest(validCase));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Error al crear el caso.");
  });

  it("returns 400 for malformed JSON body", async () => {
    const req = new NextRequest("http://localhost:3000/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const { POST } = await import("@/app/api/cases/route");
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});

describe("GET /api/cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: "user_123" });
  });

  it("returns 401 when not authenticated and no id", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const { GET } = await import("@/app/api/cases/route");
    const res = await GET(makeGetRequest());
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toContain("sesion");
  });

  it("returns 400 for invalid UUID in id param", async () => {
    const { GET } = await import("@/app/api/cases/route");
    const res = await GET(makeGetRequest({ id: "not-a-uuid" }));

    expect(res.status).toBe(400);
  });

  it("returns cases list for authenticated user", async () => {
    const mockCases = [
      { id: "1", empresa: "Telecom", status: "consulta_recibida" },
      { id: "2", empresa: "Claro", status: "enviado_empresa" },
    ];
    mockSingleResult.mockResolvedValue({ data: mockCases, error: null });

    const { GET } = await import("@/app/api/cases/route");
    const res = await GET(makeGetRequest());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
  });
});
