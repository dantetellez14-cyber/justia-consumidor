import type { JurisprudenciaCategoria } from "../../src/lib/types";

const VALID_CATEGORIES: JurisprudenciaCategoria[] = [
  "telefonica_movil", "telefonica_fija", "internet", "television_paga",
  "correo_y_paqueteria", "banca", "tarjetas_credito_debito", "prestamos_y_creditos",
  "seguros", "fintech_y_billeteras_digitales", "ecommerce", "electrodomesticos",
  "electronica_y_celulares", "indumentaria_y_calzado", "alimentos_y_bebidas",
  "muebles_y_hogar", "aerolineas", "transporte_terrestre", "automotriz_y_concesionarias",
  "taller_mecanico", "energia_electrica", "gas", "agua_y_saneamiento",
  "medicina_prepaga_y_obra_social", "farmacias_y_medicamentos", "servicios_medicos",
  "agencias_de_viaje", "hoteles_y_alojamiento", "streaming_y_entretenimiento",
  "gimnasios_y_deporte", "educacion", "servicios_profesionales",
  "inmobiliaria_y_alquiler", "construccion_y_refacciones", "publicidad_enganosa", "otro",
];

export interface NormalizeResult {
  hechos: string;
  ratio_decidendi: string;
  categoria: JurisprudenciaCategoria;
  probabilidad_exito: number;
  duracion_dias: number;
}

export function buildNormalizePrompt(texto_crudo: string): string {
  return `Eres un experto en derecho del consumidor de Argentina y México.
Dado el siguiente texto legal, extrae en JSON con exactamente estas claves:
- hechos: string (resumen de los hechos del caso en ≤150 palabras)
- ratio_decidendi: string (fundamento legal de la decisión en ≤100 palabras)
- categoria: una de [${VALID_CATEGORIES.join(", ")}]
- probabilidad_exito: número entre 0.0 y 1.0 (null si no se puede determinar)
- duracion_dias: número entero estimado (null si no se puede determinar)

Texto: ${texto_crudo}

Responde SOLO con JSON válido, sin texto adicional ni markdown.`;
}

export function parseNormalizeResponse(raw: string): NormalizeResult | null {
  try {
    // Try direct parse
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Try extracting from markdown code block
      const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlock) {
        parsed = JSON.parse(codeBlock[1].trim());
      } else {
        const braceMatch = raw.match(/\{[\s\S]*\}/);
        if (!braceMatch) return null;
        parsed = JSON.parse(braceMatch[0]);
      }
    }

    const hechos = String(parsed.hechos ?? "").trim();
    const ratio_decidendi = String(parsed.ratio_decidendi ?? "").trim();
    if (!hechos || !ratio_decidendi) return null;

    const rawProb = Number(parsed.probabilidad_exito);
    if (isNaN(rawProb) || rawProb < 0 || rawProb > 1) return null;

    const rawDias = Number(parsed.duracion_dias);
    const duracion_dias = isNaN(rawDias) || rawDias <= 0 ? 90 : Math.round(rawDias);

    const rawCat = String(parsed.categoria ?? "otro");
    const categoria: JurisprudenciaCategoria = VALID_CATEGORIES.includes(rawCat as JurisprudenciaCategoria)
      ? (rawCat as JurisprudenciaCategoria)
      : "otro";

    return { hechos, ratio_decidendi, categoria, probabilidad_exito: rawProb, duracion_dias };
  } catch {
    return null;
  }
}
