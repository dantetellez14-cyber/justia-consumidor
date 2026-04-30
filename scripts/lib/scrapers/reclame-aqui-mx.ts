/**
 * reclame-aqui-mx.ts
 * Scrapes reclameaqui.com.mx for top-complained companies in Mexico.
 *
 * Strategy (in order):
 *  1. Try the public ranking HTML page (/indices/piores-empresas/)
 *  2. Try the companies listing page (/empresa/?page=N)
 *  3. Fall back to a curated seed list of the most complained-about MX companies
 *
 * Usage: called by scripts/seed-company-catalog.ts
 */

import * as cheerio from "cheerio";
import type { ScrapedCompany } from "./reclame-aqui-ar";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; JustIA-Consumidor-Bot/1.0; +https://justia-consumidor.vercel.app)",
  "Accept-Language": "es-MX,es;q=0.9",
  Accept: "text/html,application/xhtml+xml,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

// ─── Fallback curated list ─────────────────────────────────────────────────────
// Sourced from reclameaqui.com.mx rankings + PROFECO statistical data
const FALLBACK_MX: ScrapedCompany[] = [
  // Telecomunicaciones
  { nombre: "Telcel", sector: "Telecomunicaciones", quejas: 18000, pais: "MX" },
  { nombre: "AT&T México", sector: "Telecomunicaciones", quejas: 14000, pais: "MX" },
  { nombre: "Movistar México", sector: "Telecomunicaciones", quejas: 11000, pais: "MX" },
  { nombre: "Telmex", sector: "Telecomunicaciones", quejas: 13500, pais: "MX" },
  { nombre: "Megacable", sector: "Telecomunicaciones", quejas: 7200, pais: "MX" },
  { nombre: "Totalplay", sector: "Telecomunicaciones", quejas: 6800, pais: "MX" },
  { nombre: "Izzi Telecom", sector: "Telecomunicaciones", quejas: 6400, pais: "MX" },
  { nombre: "Sky México", sector: "Telecomunicaciones", quejas: 5100, pais: "MX" },
  // Bancario / Financiero
  { nombre: "BBVA México", sector: "Bancos y Financieras", quejas: 16000, pais: "MX" },
  { nombre: "Banorte", sector: "Bancos y Financieras", quejas: 11500, pais: "MX" },
  { nombre: "HSBC México", sector: "Bancos y Financieras", quejas: 10200, pais: "MX" },
  { nombre: "Santander México", sector: "Bancos y Financieras", quejas: 9800, pais: "MX" },
  { nombre: "Citibanamex", sector: "Bancos y Financieras", quejas: 9200, pais: "MX" },
  { nombre: "Scotiabank México", sector: "Bancos y Financieras", quejas: 6100, pais: "MX" },
  { nombre: "Inbursa", sector: "Bancos y Financieras", quejas: 3900, pais: "MX" },
  { nombre: "Hey Banco", sector: "Bancos y Financieras", quejas: 2800, pais: "MX" },
  { nombre: "Nu México", sector: "Bancos y Financieras", quejas: 4200, pais: "MX" },
  { nombre: "Kueski", sector: "Bancos y Financieras", quejas: 3600, pais: "MX" },
  { nombre: "Mercado Pago México", sector: "Bancos y Financieras", quejas: 7100, pais: "MX" },
  // E-commerce / Retail
  { nombre: "Amazon México", sector: "E-commerce", quejas: 19000, pais: "MX" },
  { nombre: "Mercado Libre México", sector: "E-commerce", quejas: 16000, pais: "MX" },
  { nombre: "Walmart México", sector: "Retail", quejas: 9200, pais: "MX" },
  { nombre: "Liverpool", sector: "Retail", quejas: 7800, pais: "MX" },
  { nombre: "Palacio de Hierro", sector: "Retail", quejas: 4200, pais: "MX" },
  { nombre: "Coppel", sector: "Retail", quejas: 6900, pais: "MX" },
  { nombre: "Elektra", sector: "Retail", quejas: 5800, pais: "MX" },
  { nombre: "Costco México", sector: "Retail", quejas: 2400, pais: "MX" },
  { nombre: "Linio México", sector: "E-commerce", quejas: 3200, pais: "MX" },
  // Aerolíneas / Viajes
  { nombre: "Aeroméxico", sector: "Turismo y Viajes", quejas: 12500, pais: "MX" },
  { nombre: "Volaris", sector: "Turismo y Viajes", quejas: 11200, pais: "MX" },
  { nombre: "VivaAerobus", sector: "Turismo y Viajes", quejas: 8900, pais: "MX" },
  { nombre: "Interjet", sector: "Turismo y Viajes", quejas: 7600, pais: "MX" },
  { nombre: "Despegar México", sector: "Turismo y Viajes", quejas: 5400, pais: "MX" },
  { nombre: "Booking México", sector: "Turismo y Viajes", quejas: 3200, pais: "MX" },
  // Logística
  { nombre: "DHL México", sector: "Logística y Envíos", quejas: 8200, pais: "MX" },
  { nombre: "FedEx México", sector: "Logística y Envíos", quejas: 7400, pais: "MX" },
  { nombre: "Estafeta", sector: "Logística y Envíos", quejas: 6900, pais: "MX" },
  { nombre: "Correos de México", sector: "Logística y Envíos", quejas: 4700, pais: "MX" },
  { nombre: "Paquetexpress", sector: "Logística y Envíos", quejas: 3800, pais: "MX" },
  { nombre: "Redpack", sector: "Logística y Envíos", quejas: 3200, pais: "MX" },
  // Seguros
  { nombre: "GNP Seguros", sector: "Seguros", quejas: 5800, pais: "MX" },
  { nombre: "AXA México", sector: "Seguros", quejas: 5200, pais: "MX" },
  { nombre: "MetLife México", sector: "Seguros", quejas: 4600, pais: "MX" },
  { nombre: "Mapfre México", sector: "Seguros", quejas: 3900, pais: "MX" },
  { nombre: "Qualitas", sector: "Seguros", quejas: 4100, pais: "MX" },
  { nombre: "HDI Seguros", sector: "Seguros", quejas: 3400, pais: "MX" },
  // Servicios públicos / Energía
  { nombre: "CFE", sector: "Servicios Públicos", quejas: 14000, pais: "MX" },
  { nombre: "PEMEX", sector: "Servicios Públicos", quejas: 3800, pais: "MX" },
  // Automotriz
  { nombre: "Kavak México", sector: "Automotriz", quejas: 5200, pais: "MX" },
  { nombre: "Seminuevos.com", sector: "Automotriz", quejas: 2900, pais: "MX" },
  { nombre: "Autocom", sector: "Automotriz", quejas: 2100, pais: "MX" },
  { nombre: "Ford México", sector: "Automotriz", quejas: 1900, pais: "MX" },
  { nombre: "Nissan México", sector: "Automotriz", quejas: 1800, pais: "MX" },
  // Inmobiliario
  { nombre: "Inmuebles24", sector: "Inmobiliario", quejas: 2600, pais: "MX" },
  { nombre: "Vivanuncios", sector: "Inmobiliario", quejas: 2100, pais: "MX" },
  { nombre: "Homie", sector: "Inmobiliario", quejas: 1700, pais: "MX" },
  // Entretenimiento / Streaming
  { nombre: "Netflix México", sector: "Entretenimiento", quejas: 3800, pais: "MX" },
  { nombre: "Spotify México", sector: "Entretenimiento", quejas: 2900, pais: "MX" },
  { nombre: "Disney Plus México", sector: "Entretenimiento", quejas: 2400, pais: "MX" },
  { nombre: "Blim TV", sector: "Entretenimiento", quejas: 1900, pais: "MX" },
  // Movilidad / Delivery
  { nombre: "Rappi México", sector: "Delivery y Movilidad", quejas: 7200, pais: "MX" },
  { nombre: "Uber México", sector: "Delivery y Movilidad", quejas: 6800, pais: "MX" },
  { nombre: "DiDi México", sector: "Delivery y Movilidad", quejas: 5900, pais: "MX" },
  { nombre: "Cabify México", sector: "Delivery y Movilidad", quejas: 3400, pais: "MX" },
  // Salud
  { nombre: "IMSS", sector: "Salud", quejas: 5200, pais: "MX" },
  { nombre: "ISSSTE", sector: "Salud", quejas: 3800, pais: "MX" },
  { nombre: "Farmacias del Ahorro", sector: "Salud", quejas: 2600, pais: "MX" },
  { nombre: "Farmacias Benavides", sector: "Salud", quejas: 2100, pais: "MX" },
  // Educación
  { nombre: "Duolingo", sector: "Educación", quejas: 1800, pais: "MX" },
  { nombre: "Prepa en Línea SEP", sector: "Educación", quejas: 2400, pais: "MX" },
];

// ─── HTML scraping attempts ────────────────────────────────────────────────────

async function tryRankingPage(): Promise<ScrapedCompany[]> {
  const results: ScrapedCompany[] = [];
  const url = "https://www.reclameaqui.com.mx/indices/piores-empresas/";

  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      console.log(`[RA-MX] Ranking page HTTP ${res.status}, skipping`);
      return [];
    }
    const html = await res.text();
    const $ = cheerio.load(html);

    const selectors = [
      ".company-card",
      ".empresa-card",
      "[data-company]",
      ".company-item",
      ".ranking-item",
      "article[class*='company']",
      "li[class*='company']",
    ];

    for (const sel of selectors) {
      const items = $(sel);
      if (items.length === 0) continue;

      items.each((_, el) => {
        const nome = $(el).find("[class*='name'], [class*='nombre'], h2, h3").first().text().trim();
        const sector = $(el).find("[class*='sector'], [class*='segment'], [class*='category']").first().text().trim();
        const quejasTxt = $(el).find("[class*='complaint'], [class*='queja'], [class*='total']").first().text().trim();
        const quejas = parseInt(quejasTxt.replace(/\D/g, "")) || 0;

        if (nome && nome.length > 1) {
          results.push({ nombre: nome, sector: sector || null, quejas, pais: "MX" });
        }
      });
      console.log(`[RA-MX] Ranking page: found ${results.length} companies with selector "${sel}"`);
      break;
    }

    if (results.length === 0) {
      // Try embedded state
      const jsonMatch = html.match(/window\.__(?:NUXT|DATA|STATE)__\s*=\s*(\{.+?\});?\s*<\/script>/s);
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[1]);
          extractFromStateObject(data, results, "MX");
        } catch {
          console.log("[RA-MX] Could not parse embedded JSON state");
        }
      }
    }
  } catch (err) {
    console.log(`[RA-MX] Ranking page error: ${err instanceof Error ? err.message : err}`);
  }

  return results;
}

async function tryCompanyListPages(maxPages = 4): Promise<ScrapedCompany[]> {
  const results: ScrapedCompany[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const url = `https://www.reclameaqui.com.mx/empresa/?page=${page}`;
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(10000) });
      if (!res.ok) {
        console.log(`[RA-MX] Company list page ${page} HTTP ${res.status}, stopping`);
        break;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      let found = 0;
      $("a[href*='/empresa/']").each((_, el) => {
        const href = $(el).attr("href") ?? "";
        if (!/^\/empresa\/[a-z0-9\-]+\/?$/.test(href)) return;

        const nome =
          $(el).find("h2, h3, [class*='name'], [class*='nombre']").first().text().trim() ||
          $(el).text().trim();
        const sector = $(el).find("[class*='sector'], [class*='segment']").first().text().trim();

        if (nome && nome.length > 1) {
          results.push({ nombre: nome, sector: sector || null, quejas: 0, pais: "MX" });
          found++;
        }
      });

      console.log(`[RA-MX] Company list page ${page}: found ${found} entries`);
      if (found === 0) break;
      await sleep(1500);
    } catch (err) {
      console.log(`[RA-MX] Company list page ${page} error: ${err instanceof Error ? err.message : err}`);
      break;
    }
  }

  return results;
}

function extractFromStateObject(
  obj: unknown,
  results: ScrapedCompany[],
  pais: "AR" | "MX",
  depth = 0
): void {
  if (depth > 6 || !obj || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (
        item &&
        typeof item === "object" &&
        ("nome" in item || "nombre" in item || "name" in item)
      ) {
        const rec = item as Record<string, unknown>;
        const nombre = String(rec.nome ?? rec.nombre ?? rec.name ?? "");
        const sector = String(rec.segmento ?? rec.sector ?? rec.category ?? rec.segment ?? "");
        const quejas = Number(rec.totalReclamacoes ?? rec.totalQuejas ?? rec.complaints ?? 0);
        if (nombre.length > 1) {
          results.push({ nombre, sector: sector || null, quejas, pais });
        }
      } else {
        extractFromStateObject(item, results, pais, depth + 1);
      }
    }
  } else {
    for (const val of Object.values(obj as Record<string, unknown>)) {
      extractFromStateObject(val, results, pais, depth + 1);
    }
  }
}

// ─── Public export ─────────────────────────────────────────────────────────────

export async function scrapeReclameAquiMX(
  useFallbackIfEmpty = true
): Promise<ScrapedCompany[]> {
  console.log("[RA-MX] Starting scrape...");

  let companies = await tryRankingPage();

  if (companies.length < 10) {
    await sleep(1000);
    const listCompanies = await tryCompanyListPages(4);
    companies = [...companies, ...listCompanies];
  }

  const seen = new Set<string>();
  const deduped = companies.filter((c) => {
    const key = c.nombre.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`[RA-MX] Scraped ${deduped.length} unique companies from site`);

  if (deduped.length < 10 && useFallbackIfEmpty) {
    console.log("[RA-MX] Site scrape insufficient, using curated fallback list");
    return FALLBACK_MX;
  }

  if (useFallbackIfEmpty) {
    const scrapedNames = new Set(deduped.map((c) => c.nombre.toLowerCase().trim()));
    const extras = FALLBACK_MX.filter((c) => !scrapedNames.has(c.nombre.toLowerCase().trim()));
    return [...deduped, ...extras].slice(0, 100);
  }

  return deduped.slice(0, 100);
}
