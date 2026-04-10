import type { JurisprudenciaCaseExtended } from "../../../src/lib/types";

// Boletín Oficial de la República Argentina — JSON endpoint for Sección Primera
// Documented endpoint used by community scrapers
const BO_API = "https://www.boletinoficial.gob.ar/buscador/publicacionesBuscadorResult";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface BOPublicacion {
  id?: string;
  titulo?: string;
  sumario?: string;
  organismo?: string;
  fechaPublicacion?: string;
  urlPublicacion?: string;
}

interface BOResponse {
  publicaciones?: BOPublicacion[];
  total?: number;
}

export async function scrapeAR_BoletinOficial(
  maxPages = 4
): Promise<JurisprudenciaCaseExtended[]> {
  const results: JurisprudenciaCaseExtended[] = [];
  const pageSize = 20;

  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({
      seccion: "1",       // Sección Primera (normas generales)
      offset: String(page * pageSize),
      limite: String(pageSize),
      texto: "consumidor ley 24240",
    });

    try {
      const res = await fetch(`${BO_API}?${params}`, {
        headers: {
          "User-Agent": "JustIA-Jurisprudencia-Bot/1.0",
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        console.warn(`[BoletinOficial] HTTP ${res.status}, stopping`);
        break;
      }

      const data = (await res.json()) as BOResponse;
      const items = data.publicaciones ?? [];

      if (items.length === 0) {
        console.log(`[BoletinOficial] No items on page ${page}, stopping`);
        break;
      }

      for (const item of items) {
        const titulo = item.titulo ?? "";
        const sumario = item.sumario ?? "";
        const texto_crudo = [titulo, sumario].filter(Boolean).join(". ");
        if (!texto_crudo) continue;

        results.push({
          expediente_id: `BO-${item.id ?? titulo.slice(0, 50).replace(/\\s+/g, "-")}`,
          hechos: "",
          ratio_decidendi: "",
          probabilidad_exito: 0,
          duracion_dias: 0,
          pais: "AR",
          categoria: "otro",
          tribunal: item.organismo ?? "Boletín Oficial Argentina",
          fecha_resolucion: item.fechaPublicacion?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
          url_fuente: item.urlPublicacion ?? "https://www.boletinoficial.gob.ar",
          texto_crudo,
          normalizado_por_ia: false,
        });
      }

      console.log(`[BoletinOficial] Page ${page + 1}: ${items.length} items`);
      await sleep(2000);
    } catch (err) {
      console.warn(`[BoletinOficial] Error:`, err instanceof Error ? err.message : err);
      break;
    }
  }

  console.log(`[BoletinOficial] Total: ${results.length}`);
  return results;
}
