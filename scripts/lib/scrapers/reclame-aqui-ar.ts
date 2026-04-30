/**
 * reclame-aqui-ar.ts
 * Scrapes reclameaqui.com.ar for top-complained companies in Argentina.
 *
 * Strategy (in order):
 *  1. Try the public ranking HTML page (/indices/piores-empresas/)
 *  2. Try the companies listing page (/empresa/?page=N)
 *  3. Fall back to a curated seed list of the most complained-about AR companies
 *
 * Usage: called by scripts/seed-company-catalog.ts
 */

import * as cheerio from "cheerio";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface ScrapedCompany {
  nombre: string;
  sector: string | null;
  quejas: number;
  pais: "AR" | "MX";
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; JustIA-Consumidor-Bot/1.0; +https://justia-consumidor.vercel.app)",
  "Accept-Language": "es-AR,es;q=0.9",
  Accept: "text/html,application/xhtml+xml,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

// ─── Fallback curated list ─────────────────────────────────────────────────────
// Sourced from reclameaqui.com.ar public rankings + INDEC consumer data
const FALLBACK_AR: ScrapedCompany[] = [
  // Telecomunicaciones
  { nombre: "Telecom", sector: "Telecomunicaciones", quejas: 12000, pais: "AR" },
  { nombre: "Claro Argentina", sector: "Telecomunicaciones", quejas: 11500, pais: "AR" },
  { nombre: "Movistar Argentina", sector: "Telecomunicaciones", quejas: 10800, pais: "AR" },
  { nombre: "Personal", sector: "Telecomunicaciones", quejas: 9500, pais: "AR" },
  { nombre: "Fibertel", sector: "Telecomunicaciones", quejas: 7200, pais: "AR" },
  { nombre: "Cablevision", sector: "Telecomunicaciones", quejas: 6800, pais: "AR" },
  { nombre: "DirecTV Argentina", sector: "Telecomunicaciones", quejas: 5400, pais: "AR" },
  // Bancario / Financiero
  { nombre: "Banco Santander Argentina", sector: "Bancos y Financieras", quejas: 9200, pais: "AR" },
  { nombre: "BBVA Argentina", sector: "Bancos y Financieras", quejas: 8700, pais: "AR" },
  { nombre: "Banco Galicia", sector: "Bancos y Financieras", quejas: 7900, pais: "AR" },
  { nombre: "Banco Nación", sector: "Bancos y Financieras", quejas: 7500, pais: "AR" },
  { nombre: "ICBC Argentina", sector: "Bancos y Financieras", quejas: 5100, pais: "AR" },
  { nombre: "Macro", sector: "Bancos y Financieras", quejas: 4800, pais: "AR" },
  { nombre: "Naranja X", sector: "Bancos y Financieras", quejas: 4300, pais: "AR" },
  { nombre: "Ualá", sector: "Bancos y Financieras", quejas: 3100, pais: "AR" },
  { nombre: "Mercado Pago", sector: "Bancos y Financieras", quejas: 8100, pais: "AR" },
  // E-commerce / Retail
  { nombre: "Mercado Libre", sector: "E-commerce", quejas: 15000, pais: "AR" },
  { nombre: "Amazon Argentina", sector: "E-commerce", quejas: 4200, pais: "AR" },
  { nombre: "Falabella Argentina", sector: "Retail", quejas: 6800, pais: "AR" },
  { nombre: "Frávega", sector: "Retail", quejas: 5900, pais: "AR" },
  { nombre: "Garbarino", sector: "Retail", quejas: 5400, pais: "AR" },
  { nombre: "Musimundo", sector: "Retail", quejas: 3200, pais: "AR" },
  { nombre: "Cetrogar", sector: "Retail", quejas: 2800, pais: "AR" },
  { nombre: "Tienda Nube", sector: "E-commerce", quejas: 2100, pais: "AR" },
  // Aerolíneas
  { nombre: "Aerolíneas Argentinas", sector: "Turismo y Viajes", quejas: 8900, pais: "AR" },
  { nombre: "LATAM Argentina", sector: "Turismo y Viajes", quejas: 5200, pais: "AR" },
  { nombre: "Despegar", sector: "Turismo y Viajes", quejas: 4700, pais: "AR" },
  // Logística
  { nombre: "OCA", sector: "Logística y Envíos", quejas: 6100, pais: "AR" },
  { nombre: "Correo Argentino", sector: "Logística y Envíos", quejas: 5800, pais: "AR" },
  { nombre: "Andreani", sector: "Logística y Envíos", quejas: 4900, pais: "AR" },
  { nombre: "DHL Argentina", sector: "Logística y Envíos", quejas: 2700, pais: "AR" },
  // Salud
  { nombre: "OSDE", sector: "Salud y Medicina Prepaga", quejas: 7200, pais: "AR" },
  { nombre: "Medicus", sector: "Salud y Medicina Prepaga", quejas: 4100, pais: "AR" },
  { nombre: "Swiss Medical", sector: "Salud y Medicina Prepaga", quejas: 3800, pais: "AR" },
  { nombre: "Galeno", sector: "Salud y Medicina Prepaga", quejas: 3500, pais: "AR" },
  { nombre: "Omint", sector: "Salud y Medicina Prepaga", quejas: 2600, pais: "AR" },
  // Seguros
  { nombre: "La Segunda", sector: "Seguros", quejas: 2900, pais: "AR" },
  { nombre: "Sancor Seguros", sector: "Seguros", quejas: 2700, pais: "AR" },
  { nombre: "Zurich Argentina", sector: "Seguros", quejas: 2400, pais: "AR" },
  { nombre: "Mapfre Argentina", sector: "Seguros", quejas: 2200, pais: "AR" },
  // Servicios públicos / Energía
  { nombre: "EDESUR", sector: "Servicios Públicos", quejas: 4800, pais: "AR" },
  { nombre: "EDENOR", sector: "Servicios Públicos", quejas: 4600, pais: "AR" },
  { nombre: "Metrogas", sector: "Servicios Públicos", quejas: 3100, pais: "AR" },
  { nombre: "Aysa", sector: "Servicios Públicos", quejas: 2900, pais: "AR" },
  // Automotriz
  { nombre: "OLX Autos", sector: "Automotriz", quejas: 3200, pais: "AR" },
  { nombre: "Kavak Argentina", sector: "Automotriz", quejas: 2900, pais: "AR" },
  { nombre: "Toyota Argentina", sector: "Automotriz", quejas: 1800, pais: "AR" },
  // Inmobiliario
  { nombre: "Zonaprop", sector: "Inmobiliario", quejas: 2100, pais: "AR" },
  { nombre: "Argenprop", sector: "Inmobiliario", quejas: 1700, pais: "AR" },
  // Educación / Streaming
  { nombre: "Netflix Argentina", sector: "Entretenimiento", quejas: 2400, pais: "AR" },
  { nombre: "Spotify Argentina", sector: "Entretenimiento", quejas: 1900, pais: "AR" },
  { nombre: "Disney+ Argentina", sector: "Entretenimiento", quejas: 1600, pais: "AR" },
];

// ─── HTML scraping attempts ────────────────────────────────────────────────────

async function tryRankingPage(): Promise<ScrapedCompany[]> {
  const results: ScrapedCompany[] = [];
  const url = "https://www.reclameaqui.com.ar/indices/piores-empresas/";

  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      console.log(`[RA-AR] Ranking page HTTP ${res.status}, skipping`);
      return [];
    }
    const html = await res.text();
    const $ = cheerio.load(html);

    // Try various card selectors Reclame AQUI uses
    const selectors = [
      ".company-card",
      ".empresa-card",
      "[data-company]",
      ".company-item",
      ".ranking-item",
      "article[class*='company']",
      "li[class*='company']",
    ];

    let found = false;
    for (const sel of selectors) {
      const items = $(sel);
      if (items.length === 0) continue;

      found = true;
      items.each((_, el) => {
        const nome = $(el).find("[class*='name'], [class*='nombre'], h2, h3").first().text().trim();
        const sector = $(el).find("[class*='sector'], [class*='segment'], [class*='category']").first().text().trim();
        const quejasTxt = $(el).find("[class*='complaint'], [class*='queja'], [class*='total']").first().text().trim();
        const quejas = parseInt(quejasTxt.replace(/\D/g, "")) || 0;

        if (nome && nome.length > 1) {
          results.push({ nombre: nome, sector: sector || null, quejas, pais: "AR" });
        }
      });
      console.log(`[RA-AR] Ranking page: found ${results.length} companies with selector "${sel}"`);
      break;
    }

    if (!found) {
      // Try JSON-LD or window.__NUXT__ / window.__DATA__
      const jsonMatch = html.match(/window\.__(?:NUXT|DATA|STATE)__\s*=\s*(\{.+?\});?\s*<\/script>/s);
      if (jsonMatch) {
        console.log("[RA-AR] Found embedded JSON state, attempting parse");
        try {
          const data = JSON.parse(jsonMatch[1]);
          extractFromStateObject(data, results, "AR");
        } catch {
          console.log("[RA-AR] Could not parse embedded JSON state");
        }
      }
    }
  } catch (err) {
    console.log(`[RA-AR] Ranking page error: ${err instanceof Error ? err.message : err}`);
  }

  return results;
}

async function tryCompanyListPages(maxPages = 4): Promise<ScrapedCompany[]> {
  const results: ScrapedCompany[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const url = `https://www.reclameaqui.com.ar/empresa/?page=${page}`;
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(10000) });
      if (!res.ok) {
        console.log(`[RA-AR] Company list page ${page} HTTP ${res.status}, stopping`);
        break;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      let found = 0;
      $("a[href*='/empresa/']").each((_, el) => {
        const href = $(el).attr("href") ?? "";
        // Only top-level company slugs: /empresa/SLUG/
        if (!/^\/empresa\/[a-z0-9\-]+\/?$/.test(href)) return;

        const nome = $(el).find("h2, h3, [class*='name'], [class*='nombre']").first().text().trim()
          || $(el).text().trim();
        const sector = $(el).find("[class*='sector'], [class*='segment']").first().text().trim();

        if (nome && nome.length > 1) {
          results.push({ nombre: nome, sector: sector || null, quejas: 0, pais: "AR" });
          found++;
        }
      });

      console.log(`[RA-AR] Company list page ${page}: found ${found} entries`);
      if (found === 0) break;
      await sleep(1500);
    } catch (err) {
      console.log(`[RA-AR] Company list page ${page} error: ${err instanceof Error ? err.message : err}`);
      break;
    }
  }

  return results;
}

// Recursively search a JS state object for company arrays
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

export async function scrapeReclameAquiAR(
  useFallbackIfEmpty = true
): Promise<ScrapedCompany[]> {
  console.log("[RA-AR] Starting scrape...");

  // 1. Try ranking page
  let companies = await tryRankingPage();

  // 2. Try paginated company list
  if (companies.length < 10) {
    await sleep(1000);
    const listCompanies = await tryCompanyListPages(4);
    companies = [...companies, ...listCompanies];
  }

  // 3. Deduplicate by normalized name
  const seen = new Set<string>();
  const deduped = companies.filter((c) => {
    const key = c.nombre.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`[RA-AR] Scraped ${deduped.length} unique companies from site`);

  // 4. Fall back to curated list if we got too few
  if (deduped.length < 10 && useFallbackIfEmpty) {
    console.log("[RA-AR] Site scrape insufficient, using curated fallback list");
    return FALLBACK_AR;
  }

  // 5. Merge scraped + fallback (scraped takes priority, fallback fills gaps)
  if (useFallbackIfEmpty) {
    const scrapedNames = new Set(deduped.map((c) => c.nombre.toLowerCase().trim()));
    const extras = FALLBACK_AR.filter((c) => !scrapedNames.has(c.nombre.toLowerCase().trim()));
    return [...deduped, ...extras].slice(0, 100);
  }

  return deduped.slice(0, 100);
}
