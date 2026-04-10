import * as cheerio from "cheerio";
import type { JurisprudenciaCaseExtended } from "../../../src/lib/types";

const DESCAJUS_URL = "https://juristeca.jusbaires.gob.ar/jurisprudencia-relevante-en-relaciones-de-consumo/";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function scrapeAR_DESCAjus(): Promise<JurisprudenciaCaseExtended[]> {
  try {
    const res = await fetch(DESCAJUS_URL, {
      headers: { "User-Agent": "JustIA-Jurisprudencia-Bot/1.0" },
    });

    if (!res.ok) {
      console.warn(`[DESCAjus] HTTP ${res.status}`);
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const results: JurisprudenciaCaseExtended[] = [];

    $("article, .entry, .post, li.caso").each((_, el) => {
      const titleEl = $(el).find("h2 a, h3 a, a.titulo").first();
      const title = titleEl.text().trim();
      const href = titleEl.attr("href") ?? "";
      const excerpt = $(el).find("p, .excerpt, .resumen").first().text().trim();

      if (!title) return;

      results.push({
        expediente_id: `DESCAJUS-${title.slice(0, 60).replace(/\s+/g, "-")}`,
        hechos: "",
        ratio_decidendi: "",
        probabilidad_exito: 0,
        duracion_dias: 0,
        pais: "AR",
        categoria: "otro",
        tribunal: "Tribunal de Relaciones del Consumo CABA",
        fecha_resolucion: new Date().toISOString().slice(0, 10),
        url_fuente: href.startsWith("http") ? href : `https://juristeca.jusbaires.gob.ar${href}`,
        texto_crudo: [title, excerpt].filter(Boolean).join(". "),
        normalizado_por_ia: false,
      });
    });

    console.log(`[DESCAjus] Extracted: ${results.length}`);
    await sleep(2000);
    return results;
  } catch (err) {
    console.warn(`[DESCAjus] Error:`, err instanceof Error ? err.message : err);
    return [];
  }
}
