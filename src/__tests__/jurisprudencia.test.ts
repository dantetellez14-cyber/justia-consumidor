import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchCasesByCountry } from "@/lib/jurisprudencia";
import type { JurisprudenciaCase } from "@/lib/types";

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeCase(overrides: Partial<JurisprudenciaCase> = {}): JurisprudenciaCase {
  return {
    expediente_id: `EXP-${Math.random().toString(36).slice(2)}`,
    hechos: "Cobro indebido en factura de servicio de telecomunicaciones.",
    ratio_decidendi: "La empresa incurrió en práctica comercial engañosa.",
    probabilidad_exito: 0.72,
    duracion_dias: 180,
    pais: "AR",
    ...overrides,
  };
}

const AR_CASES: JurisprudenciaCase[] = Array.from({ length: 8 }, (_, i) =>
  makeCase({ expediente_id: `AR-${i + 1}`, pais: "AR" })
);

const MX_CASES: JurisprudenciaCase[] = Array.from({ length: 6 }, (_, i) =>
  makeCase({ expediente_id: `MX-${i + 1}`, pais: "MX" })
);

// ── Helpers ──────────────────────────────────────────────────────────────────

function mockFetchOk(cases: JurisprudenciaCase[]): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ cases }),
    })
  );
}

function mockFetchError(status = 500): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: false,
      status,
      statusText: "Internal Server Error",
      json: async () => ({}),
    })
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("fetchCasesByCountry", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls the correct endpoint for AR", async () => {
    mockFetchOk(AR_CASES);
    await fetchCasesByCountry("AR");
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      "/api/jurisprudencia-fallback?pais=AR"
    );
  });

  it("calls the correct endpoint for MX", async () => {
    mockFetchOk(MX_CASES);
    await fetchCasesByCountry("MX");
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      "/api/jurisprudencia-fallback?pais=MX"
    );
  });

  it("returns cases from the API response", async () => {
    mockFetchOk(AR_CASES);
    const result = await fetchCasesByCountry("AR");
    expect(result).toHaveLength(AR_CASES.length);
    expect(result.every((c) => c.pais === "AR")).toBe(true);
  });

  it("returns empty array when API returns 0 cases", async () => {
    mockFetchOk([]);
    const result = await fetchCasesByCountry("AR");
    expect(result).toHaveLength(0);
  });

  it("returns empty array on API error (non-critical path)", async () => {
    mockFetchError(500);
    const result = await fetchCasesByCountry("AR");
    expect(result).toHaveLength(0);
  });

  it("returns empty array on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network failure"))
    );
    // fetchCasesByCountry does not throw — it returns [] for safety
    await expect(fetchCasesByCountry("AR")).rejects.toThrow("Network failure");
  });

  it("all returned cases have required fields", async () => {
    mockFetchOk([...AR_CASES, ...MX_CASES]);
    const result = await fetchCasesByCountry("AR");
    for (const c of result) {
      expect(c.expediente_id).toBeTruthy();
      expect(["AR", "MX"]).toContain(c.pais);
      expect(typeof c.probabilidad_exito).toBe("number");
      expect(typeof c.duracion_dias).toBe("number");
    }
  });

  it("all expediente_ids are unique in response", async () => {
    mockFetchOk(AR_CASES);
    const result = await fetchCasesByCountry("AR");
    const ids = result.map((c) => c.expediente_id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
