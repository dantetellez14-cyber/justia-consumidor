import * as cheerio from "cheerio";
import type { JurisprudenciaCaseExtended } from "../../../src/lib/types";

// CSJN Secretaría de Jurisprudencia — Suplemento Usuarios y Consumidores
const CSJN_URL = "https://sj.csjn.gov.ar/homeSJ/suplementos/suplemento/74/documento";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function scrapeAR_CSJN(): Promise<JurisprudenciaCaseExtended[]> {
  try {
    const res = await fetch(CSJN_URL, {
      headers: { "User-Agent": "JustIA-Jurisprudencia-Bot/1.0" },
    });

    if (!res.ok) {
      console.warn(`[CSJN] HTTP ${res.status}`);
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const results: JurisprudenciaCaseExtended[] = [];

    // CSJN suplemento lists cases with expediente, fecha, sumario
    $("tr.fallo, .fallo-item, table tr").each((_, el) => {
      const cells = $(el).find("td");
      if (cells.length < 2) return;

      const expediente = cells.eq(0).text().trim();
      const sumario = cells.eq(cells.length - 1).text().trim();
      const fecha = cells.eq(1).text().trim();

      if (!expediente || !sumario) return;

      results.push({
        expediente_id: `CSJN-${expediente.replace(/\s+/g, "-")}`,
        hechos: "",
        ratio_decidendi: "",
        probabilidad_exito: 0,
        duracion_dias: 0,
        pais: "AR",
        categoria: "otro",
        tribunal: "Corte Suprema de Justicia de la Nación",
        fecha_resolucion: parseDateAR(fecha),
        url_fuente: CSJN_URL,
        texto_crudo: [expediente, sumario].join(". "),
        normalizado_por_ia: false,
      });
    });

    console.log(`[CSJN] Extracted: ${results.length}`);
    await sleep(2000);
    return results;
  } catch (err) {
    console.warn(`[CSJN] Error:`, err instanceof Error ? err.message : err);
    return [];
  }
}

function parseDateAR(str: string): string {
  const match = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return new Date().toISOString().slice(0, 10);
}
