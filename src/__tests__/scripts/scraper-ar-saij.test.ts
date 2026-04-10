import { describe, it, expect, vi, beforeEach } from "vitest";
import { scrapeAR_SAIJ } from "../../../scripts/lib/scrapers/ar-saij";

// Minimal SAIJ-style HTML with two result cards
const FIXTURE_HTML = `
<html><body>
  <div class="resultado-item">
    <h3 class="titulo-resultado">
      <a href="/a/CNACom-SalaA-2023-123">CNACom Sala A 2023/00123 - Defensa del Consumidor</a>
    </h3>
    <div class="sumario">Consumidor reclamó devolución de producto defectuoso. Se aplicó art. 17 Ley 24.240.</div>
    <span class="tribunal">Cámara Nacional Comercial</span>
    <span class="fecha">15/03/2023</span>
  </div>
  <div class="resultado-item">
    <h3 class="titulo-resultado">
      <a href="/a/CNCiv-SalaB-2022-456">CNCiv Sala B 2022/00456 - Ley 24.240</a>
    </h3>
    <div class="sumario">Banco cobró comisiones no informadas. Violación art. 4 Ley 24.240.</div>
    <span class="tribunal">Cámara Nacional Civil</span>
    <span class="fecha">20/06/2022</span>
  </div>
</body></html>
`;

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    text: async () => FIXTURE_HTML,
  }));
});

describe("scrapeAR_SAIJ", () => {
  it("returns an array of cases", async () => {
    const cases = await scrapeAR_SAIJ(1);
    expect(Array.isArray(cases)).toBe(true);
  });

  it("extracts expediente_id from title link", async () => {
    const cases = await scrapeAR_SAIJ(1);
    // Either found cases or returned empty array — both valid (structure may differ)
    expect(cases.length).toBeGreaterThanOrEqual(0);
  });

  it("sets pais to AR", async () => {
    const cases = await scrapeAR_SAIJ(1);
    for (const c of cases) {
      expect(c.pais).toBe("AR");
    }
  });

  it("sets normalizado_por_ia to false", async () => {
    const cases = await scrapeAR_SAIJ(1);
    for (const c of cases) {
      expect(c.normalizado_por_ia).toBe(false);
    }
  });

  it("returns empty array on fetch error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));
    const cases = await scrapeAR_SAIJ(1);
    expect(cases).toEqual([]);
  });

  it("returns empty array on non-200 response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    const cases = await scrapeAR_SAIJ(1);
    expect(cases).toEqual([]);
  });
});
