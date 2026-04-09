import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAuth = vi.fn();
const mockRateLimit = vi.fn().mockResolvedValue({ allowed: true, resetIn: 0 });
const mockGetClientIp = vi.fn().mockReturnValue("127.0.0.1");
const mockGetCompanyForUser = vi.fn();
const mockSubmitResponse = vi.fn();
const mockNotifyConsumerResponse = vi.fn().mockResolvedValue(undefined);

vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
  getClientIp: (...args: unknown[]) => mockGetClientIp(...args),
}));

vi.mock("@/lib/empresa", () => ({
  getCompanyForUser: (...args: unknown[]) => mockGetCompanyForUser(...args),
  submitResponse: (...args: unknown[]) => mockSubmitResponse(...args),
}));

vi.mock("@/lib/notifications", () => ({
  notifyConsumerResponse: (...args: unknown[]) => mockNotifyConsumerResponse(...args),
}));

import { POST } from "@/app/api/empresa/respond/route";
import { NextRequest } from "next/server";

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/empresa/respond", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  case_id: "550e8400-e29b-41d4-a716-446655440000",
  tipo_respuesta: "aceptar",
  mensaje: "Aceptamos su reclamo y procederemos con la devolucion.",
};

describe("POST /api/empresa/respond - verification guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when company is not verified", async () => {
    mockAuth.mockResolvedValue({ userId: "user_abc" });
    mockGetCompanyForUser.mockResolvedValue({
      account: { id: "comp_1", nombre: "Mi Tienda", verificada: false },
      role: "admin",
    });

    const res = await POST(makeRequest(validBody));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toContain("pendiente de verificacion");
  });

  it("allows response when company is verified", async () => {
    mockAuth.mockResolvedValue({ userId: "user_abc" });
    mockGetCompanyForUser.mockResolvedValue({
      account: { id: "comp_1", nombre: "Telmex", verificada: true },
      role: "admin",
    });
    mockSubmitResponse.mockResolvedValue({
      id: "resp_1",
      tipo_respuesta: "aceptar",
      mensaje: "Aceptamos su reclamo y procederemos con la devolucion.",
    });

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
  });
});
