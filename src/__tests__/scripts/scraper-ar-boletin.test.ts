import { describe, it, expect, vi, beforeEach } from "vitest";
import { scrapeAR_BoletinOficial } from "../../../scripts/lib/scrapers/ar-boletin";

const FIXTURE_JSON = JSON.stringify({
  publicaciones: [
    {
      id: "DISP-12345",
      titulo: "Disposición 1234/2023 - Sanción a empresa por infracción Ley 24.240",
      sumario: "Se sanciona a empresa Telecom SA por cobro indebido de servicios no prestados.",
      organismo: "Subsecretaría de Defensa del Consumidor",
      fechaPublicacion: "2023-05-10",
      urlPublicacion: "https://www.boletinoficial.gob.ar/detalleAviso/primera/12345",
    },
    {
      id: "DISP-67890",
      titulo: "Disposición 5678/2023 - Multa por publicidad engañosa",
      sumario: "Multa aplicada por incumplimiento art. 8 Ley 24.240 publicidad engañosa.",
      organismo: "Subsecretaría de Defensa del Consumidor",
      fechaPublicacion: "2023-06-15",
      urlPublicacion: "https://www.boletinoficial.gob.ar/detalleAviso/primera/67890",
    },
  ],
  total: 2,
});

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: async () => JSON.parse(FIXTURE_JSON),
  }));
});

describe("scrapeAR_BoletinOficial", () => {
  it("returns array of cases", async () => {
    const cases = await scrapeAR_BoletinOficial(1);
    expect(Array.isArray(cases)).toBe(true);
  });

  it("sets pais to AR for all cases", async () => {
    const cases = await scrapeAR_BoletinOficial(1);
    for (const c of cases) {
      expect(c.pais).toBe("AR");
    }
  });

  it("sets normalizado_por_ia to false", async () => {
    const cases = await scrapeAR_BoletinOficial(1);
    for (const c of cases) {
      expect(c.normalizado_por_ia).toBe(false);
    }
  });

  it("returns empty array on fetch error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const cases = await scrapeAR_BoletinOficial(1);
    expect(cases).toEqual([]);
  });

  it("returns empty array on non-200 response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const cases = await scrapeAR_BoletinOficial(1);
    expect(cases).toEqual([]);
  });
});
