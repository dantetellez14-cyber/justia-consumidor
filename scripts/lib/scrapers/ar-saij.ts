import * as cheerio from "cheerio";
import type { JurisprudenciaCaseExtended } from "../../../src/lib/types";

const BASE_URL = "https://www.saij.gob.ar";
const SEARCH_URL = `${BASE_URL}/resultados.jsp`;
const QUERY_PARAMS = new URLSearchParams({
  o: "0",
  p: "25",
  "f": "Total|Tipo+de+Documento/Jurisprudencia",
  q: "relacion de consumo ley 24240",
  s: "fecha-rango|DESC",
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function scrapeAR_SAIJ(
  maxPages = 4
): Promise<JurisprudenciaCaseExtended[]> {
  const results: JurisprudenciaCaseExtended[] = [];

  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams(QUERY_PARAMS);
    params.set("o", String(page * 25));
    const url = `${SEARCH_URL}?${params.toString()}`;

    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "JustIA-Jurisprudencia-Bot/1.0" },
      });
      if (!res.ok) {
        console.warn(`[SAIJ] HTTP ${res.status} on page ${page}, stopping`);
        break;
      }

      const html = await res.text();
      const $ = cheerio.load(html);
      const items = $(".resultado-item, .result-item, article.resultado");

      if (items.length === 0) {
        console.log(`[SAIJ] No items found on page ${page}, stopping`);
        break;
      }

      items.each((_, el) => {
        try {
          const titleEl = $(el).find("h3 a, h2 a, .titulo-resultado a").first();
          const title = titleEl.text().trim();
          const href = titleEl.attr("href") ?? "";
          const sumario = $(el).find(".sumario, .resumen, p").first().text().trim();
          const tribunal = $(el).find(".tribunal, .organismo").first().text().trim();
          const fechaStr = $(el).find(".fecha, time").first().text().trim();

          if (!title && !sumario) return;

          const expediente_id = title || `SAIJ-${href.replace(/[^a-zA-Z0-9]/g, "-")}`;
          const texto_crudo = [title, sumario].filter(Boolean).join(". ");
          const fecha_resolucion = parseDateAR(fechaStr);

          results.push({
            expediente_id,
            hechos: "",
            ratio_decidendi: "",
            probabilidad_exito: 0,
            duracion_dias: 0,
            pais: "AR",
            categoria: "otro",
            tribunal: tribunal || "SAIJ",
            fecha_resolucion,
            url_fuente: href.startsWith("http") ? href : `${BASE_URL}${href}`,
            texto_crudo,
            normalizado_por_ia: false,
          });
        } catch {
          // Skip malformed items
        }
      });

      console.log(`[SAIJ] Page ${page + 1}: found ${items.length} items`);
      await sleep(2000);
    } catch (err) {
      console.warn(
        `[SAIJ] Error on page ${page}:`,
        err instanceof Error ? err.message : err
      );
      break;
    }
  }

  console.log(`[SAIJ] Total extracted: ${results.length}`);
  return results;
}

function parseDateAR(str: string): string {
  // Converts "15/03/2023" → "2023-03-15"
  const match = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return new Date().toISOString().slice(0, 10);
}
