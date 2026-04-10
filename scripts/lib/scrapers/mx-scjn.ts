import * as cheerio from "cheerio";
import type { JurisprudenciaCaseExtended } from "../../../src/lib/types";

// SCJN Buscador Jurídico — sentencias públicas index
const SCJN_API = "https://bj.scjn.gob.mx/busqueda";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function scrapeMX_SCJN(
  maxPages = 3
): Promise<JurisprudenciaCaseExtended[]> {
  const results: JurisprudenciaCaseExtended[] = [];

  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({
      q: "consumidor LFPC protección",
      indice: "sentencias_pub",
      from: String(page * 10),
    });

    try {
      const res = await fetch(`${SCJN_API}?${params}`, {
        headers: { "User-Agent": "JustIA-Jurisprudencia-Bot/1.0" },
      });

      if (!res.ok) {
        console.warn(`[SCJN] HTTP ${res.status}, stopping`);
        break;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      const cards = $(".resultado-sentencia, .sentencia-card, article");
      if (cards.length === 0) break;

      cards.each((_, el) => {
        try {
          const titleEl = $(el).find("h2 a, h3 a, .titulo a").first();
          const title = titleEl.text().trim();
          const href = titleEl.attr("href") ?? "";
          const body = $(el).find("p, .extracto, .resumen").first().text().trim();

          if (!title) return;

          const texto_crudo = [title, body].filter(Boolean).join(". ").slice(0, 2000);
          const organo = $(el).find(".organo, .tribunal").first().text().trim();
          const fecha = $(el).find(".fecha, time").first().text().trim();

          results.push({
            expediente_id: `SCJN-${title.slice(0, 60).replace(/\s+/g, "-")}`,
            hechos: "",
            ratio_decidendi: "",
            probabilidad_exito: 0,
            duracion_dias: 0,
            pais: "MX",
            categoria: "otro",
            tribunal: organo || "SCJN",
            fecha_resolucion: parseDateMX(fecha),
            url_fuente: href.startsWith("http") ? href : `https://bj.scjn.gob.mx${href}`,
            texto_crudo,
            normalizado_por_ia: false,
          });
        } catch {
          // Skip malformed
        }
      });

      console.log(`[SCJN] Page ${page + 1}: ${cards.length} items`);
      await sleep(2000);
    } catch (err) {
      console.warn(`[SCJN] Error:`, err instanceof Error ? err.message : err);
      break;
    }
  }

  console.log(`[SCJN] Total: ${results.length}`);
  return results;
}

function parseDateMX(str: string): string {
  // Tries "DD/MM/YYYY" or "YYYY-MM-DD"
  const dmy = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const iso = str.match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  return new Date().toISOString().slice(0, 10);
}
