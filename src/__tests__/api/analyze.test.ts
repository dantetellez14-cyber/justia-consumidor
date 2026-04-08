import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock rate-limit to always allow
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 9, resetIn: 60 }),
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

// Mock global fetch so it never hits Ollama
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/analyze", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("DEMO_MODE", "true");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    // Make fetch fail so demo mode kicks in
    mockFetch.mockRejectedValue(new TypeError("fetch failed"));
  });

  it("returns 400 for missing relato", async () => {
    const { POST } = await import("@/app/api/analyze/route");
    const res = await POST(makeRequest({}));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it("returns 400 for short relato", async () => {
    const { POST } = await import("@/app/api/analyze/route");
    const res = await POST(makeRequest({ relato: "corto" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("10");
  });

  it("returns 400 for non-string relato", async () => {
    const { POST } = await import("@/app/api/analyze/route");
    const res = await POST(makeRequest({ relato: 12345 }));

    expect(res.status).toBe(400);
  });

  it("returns demo analysis in DEMO_MODE", async () => {
    const { POST } = await import("@/app/api/analyze/route");
    const res = await POST(
      makeRequest({
        relato:
          "Compré un televisor en la empresa MercadoLibre pero nunca me llegó el producto y no me quieren devolver el dinero de $50000",
      })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty("empresa");
    expect(data).toHaveProperty("producto_servicio");
    expect(data).toHaveProperty("monto_reclamo");
    expect(data).toHaveProperty("probabilidad_exito");
    expect(data).toHaveProperty("analisis_legal");
    expect(data).toHaveProperty("pais_detectado");
    expect(["AR", "MX"]).toContain(data.pais_detectado);
  });

  it("detects Mexico from relato keywords", async () => {
    const { POST } = await import("@/app/api/analyze/route");
    const res = await POST(
      makeRequest({
        relato:
          "Compré un producto en CDMX por $15000 MXN en la empresa Walmart México pero salió defectuoso y PROFECO no me ayuda",
      })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.pais_detectado).toBe("MX");
    expect(data.analisis_legal).toContain("LFPC");
  });

  it("detects Argentina by default", async () => {
    const { POST } = await import("@/app/api/analyze/route");
    const res = await POST(
      makeRequest({
        relato:
          "Compré un lavarropas en la empresa Garbarino pero se rompió a los dos meses y no me quieren dar garantía",
      })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.pais_detectado).toBe("AR");
    expect(data.analisis_legal).toContain("24.240");
  });

  it("extracts amount from relato", async () => {
    const { POST } = await import("@/app/api/analyze/route");
    const res = await POST(
      makeRequest({
        relato:
          "La empresa Fravega me cobró $75000 de más en la factura del aire acondicionado y no quiere reconocer el error",
      })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.monto_reclamo).toBe(75000);
  });
});

describe("POST /api/analyze - rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 429 when rate limited", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    vi.mocked(rateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetIn: 45,
    });

    const { POST } = await import("@/app/api/analyze/route");
    const res = await POST(
      makeRequest({ relato: "Un relato suficientemente largo para pasar validación" })
    );
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toContain("45");
  });
});
