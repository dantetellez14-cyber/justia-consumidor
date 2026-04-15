import type { JurisprudenciaCaseExtended } from "../../../src/lib/types";

// Semanario Judicial de la Federación — search API endpoint
// Tesis jurisprudenciales on consumer protection (materia: civil/administrativa)
const SJF2_API = "https://sjf2.scjn.gob.mx/es/tesis/_search";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface SJF2Hit {
  _id?: string;
  _source?: {
    rubro?: string;
    texto?: string;
    localizacion?: string;
    organo?: string;
    fechaSesion?: string;
    tipo?: string;
  };
}

interface SJF2Response {
  hits?: {
    hits?: SJF2Hit[];
    total?: { value: number };
  };
}

export async function scrapeMX_SJF2(
  maxPages = 4
): Promise<JurisprudenciaCaseExtended[]> {
  const results: JurisprudenciaCaseExtended[] = [];
  const pageSize = 20;

  for (let page = 0; page < maxPages; page++) {
    const body = {
      from: page * pageSize,
      size: pageSize,
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: "consumidor LFPC protección",
                fields: ["rubro^3", "texto", "notas"],
              },
            },
          ],
          filter: [{ term: { tipo: "JURISPRUDENCIA" } }],
        },
      },
      sort: [{ fechaSesion: { order: "desc" } }],
    };

    try {
      const res = await fetch(SJF2_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.warn(`[SJF2] HTTP ${res.status}, stopping`);
        break;
      }

      const data = (await res.json()) as SJF2Response;
      const hits = data.hits?.hits ?? [];

      if (hits.length === 0) {
        console.log(`[SJF2] No hits on page ${page}, stopping`);
        break;
      }

      for (const hit of hits) {
        const src = hit._source ?? {};
        const rubro = src.rubro ?? "";
        const texto = src.texto ?? "";
        const texto_crudo = [rubro, texto].filter(Boolean).join(". ").slice(0, 2000);
        if (!texto_crudo) continue;

        const id = hit._id ?? rubro.slice(0, 50).replace(/\s+/g, "-");

        results.push({
          expediente_id: `SJF2-${id}`,
          hechos: "",
          ratio_decidendi: "",
          probabilidad_exito: 0,
          duracion_dias: 0,
          pais: "MX",
          categoria: "otro",
          tribunal: src.organo ?? "SCJN",
          fecha_resolucion: src.fechaSesion?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
          url_fuente: `https://sjf2.scjn.gob.mx/detalle/tesis/${id}`,
          texto_crudo,
          normalizado_por_ia: false,
        });
      }

      console.log(`[SJF2] Page ${page + 1}: ${hits.length} hits`);
      await sleep(2000);
    } catch (err) {
      console.warn(`[SJF2] Error:`, err instanceof Error ? err.message : err);
      break;
    }
  }

  console.log(`[SJF2] Total: ${results.length}`);
  return results;
}
