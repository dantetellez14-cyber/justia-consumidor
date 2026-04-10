import { describe, it, expect, vi, beforeEach } from "vitest";
import { scrapeMX_SJF2 } from "../../../scripts/lib/scrapers/mx-sjf2";

// SJF2 returns JSON search results
const FIXTURE_JSON = JSON.stringify({
  hits: {
    hits: [
      {
        _id: "2031001",
        _source: {
          rubro: "CONSUMIDOR. Garantía de bienes",
          texto: "El consumidor tiene derecho a que los bienes adquiridos cuenten con garantía mínima.",
          localizacion: "2a./J. 15/2023 (11a.)",
          organo: "Segunda Sala",
          fechaSesion: "2023-03-10",
          tipo: "JURISPRUDENCIA",
        },
      },
      {
        _id: "2031002",
        _source: {
          rubro: "PROTECCIÓN AL CONSUMIDOR. Cláusulas abusivas",
          texto: "Las cláusulas que limiten los derechos del consumidor son nulas de pleno derecho.",
          localizacion: "1a./J. 22/2023 (11a.)",
          organo: "Primera Sala",
          fechaSesion: "2023-05-20",
          tipo: "JURISPRUDENCIA",
        },
      },
    ],
  },
});

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: async () => JSON.parse(FIXTURE_JSON),
  }));
});

describe("scrapeMX_SJF2", () => {
  it("returns array of cases", async () => {
    const cases = await scrapeMX_SJF2(1);
    expect(Array.isArray(cases)).toBe(true);
  });

  it("sets pais to MX for all cases", async () => {
    const cases = await scrapeMX_SJF2(1);
    for (const c of cases) {
      expect(c.pais).toBe("MX");
    }
  });

  it("sets normalizado_por_ia to false", async () => {
    const cases = await scrapeMX_SJF2(1);
    for (const c of cases) {
      expect(c.normalizado_por_ia).toBe(false);
    }
  });

  it("returns empty array on fetch error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    const cases = await scrapeMX_SJF2(1);
    expect(cases).toEqual([]);
  });
});
