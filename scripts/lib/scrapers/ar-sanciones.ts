/**
 * ar-sanciones.ts
 *
 * Scrapes the "Sanciones aplicadas en Defensa del Consumidor" dataset from
 * datos.produccion.gob.ar — a public XLSX published by Argentina's Secretaría
 * de Industria y Comercio (successor to COPREC/Defensa del Consumidor).
 *
 * ~1,644 rows · Fields: Empresa, Infracción, Descripción, Monto, Fecha
 * Each row = a company that was fined → probabilidad_exito 0.75 (consumer won).
 *
 * Dataset: https://datos.produccion.gob.ar/dataset/sanciones-aplicadas-en-defensa-de-las-y-los-consumidores
 */

import * as XLSX from "xlsx";
import type { JurisprudenciaCaseExtended } from "../../../src/lib/types";

const XLSX_URL =
  "https://datos.produccion.gob.ar/dataset/b1914d9e-b443-4073-a1dd-e9454f09778b/resource/15b202a8-a546-4c97-8a1e-4de92b52451a/download/sanciones-aplicadas-defensa-consumidor.xlsx";

// Map common infraction keywords → JurisprudenciaCategoria
function inferCategoria(
  infraccion: string,
  empresa: string
): JurisprudenciaCaseExtended["categoria"] {
  const text = `${infraccion} ${empresa}`.toLowerCase();
  if (/banco|financier|crédit|tarjeta|seguro|prepaga/.test(text)) return "banca";
  if (/telecom|telefon|personal|claro|movistar|internet|cablevision/.test(text)) return "telefonica_movil";
  if (/aerolín|vuelo|airline|aerolineas|lade/.test(text)) return "aerolineas";
  if (/supermercado|walmart|coto|dia|carrefour|hipermercado/.test(text)) return "supermercados";
  if (/auto|concesion|volkswagen|ford|chevrolet|renault|plan de ahorro/.test(text)) return "automotriz";
  if (/electric|electro|newsan|whirlpool|samsung|lg|philips/.test(text)) return "electrodomesticos";
  if (/farmacia|medicamento|salud/.test(text)) return "salud";
  if (/e.?commerce|tienda|retail|falabella|garbarino|fravega/.test(text)) return "ecommerce";
  return "otro";
}

// Convert Excel serial date or string to ISO date
function parseExcelDate(raw: unknown): string {
  if (typeof raw === "number") {
    // Excel date serial → JS date
    const date = XLSX.SSF.parse_date_code(raw);
    if (date) {
      const y = date.y;
      const m = String(date.m).padStart(2, "0");
      const d = String(date.d).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }
  if (typeof raw === "string") {
    // Try "DD/MM/YYYY"
    const match = raw.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;
    // Try "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  }
  return new Date().toISOString().slice(0, 10);
}

function normalizeId(disposicion: unknown): string {
  const raw = String(disposicion ?? "").trim().replace(/\s+/g, "_");
  return `AR_SANCION_${raw}` || `AR_SANCION_${Date.now()}`;
}

export async function scrapeAR_Sanciones(): Promise<JurisprudenciaCaseExtended[]> {
  console.log("[AR-Sanciones] Descargando dataset XLSX...");

  let buffer: ArrayBuffer;
  try {
    const res = await fetch(XLSX_URL, {
      headers: { "User-Agent": "JustIA-Jurisprudencia-Bot/1.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    buffer = await res.arrayBuffer();
  } catch (err) {
    console.error("[AR-Sanciones] Error descargando XLSX:", err);
    return [];
  }

  const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to array of objects using first row as headers
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: true,
  });

  console.log(`[AR-Sanciones] ${rows.length} filas encontradas`);

  const results: JurisprudenciaCaseExtended[] = [];

  for (const row of rows) {
    try {
      // Flexible column name matching (sheet headers may vary slightly)
      const disposicion = row["N° de Disposición"] ?? row["Nro de Disposicion"] ?? row["Disposicion"] ?? row["N°"] ?? "";
      const empresa = String(row["Empresa"] ?? row["empresa"] ?? "").trim();
      const infraccion = String(row["Infracción"] ?? row["Infraccion"] ?? row["Art"] ?? "").trim();
      const descripcion = String(row["Descripción"] ?? row["Descripcion"] ?? row["descripcion"] ?? "").trim();
      const monto = row["Monto"] ?? row["monto"] ?? 0;
      const fecha = row["Fecha"] ?? row["fecha"] ?? "";

      if (!empresa) continue;

      const montoNum = typeof monto === "number" ? monto : parseFloat(String(monto).replace(/[^0-9.]/g, "")) || 0;
      const montoStr = montoNum > 0 ? `$${montoNum.toLocaleString("es-AR")} ARS` : "no especificado";

      const expediente_id = normalizeId(disposicion || `${empresa}_${fecha}`);
      const texto_crudo = [empresa, infraccion, descripcion, String(fecha)].filter(Boolean).join(". ");

      const hechos = `Infracción a ${infraccion || "normas de defensa del consumidor"}: ${descripcion || "incumplimiento detectado"} por ${empresa}.`;
      const ratio_decidendi = `Empresa sancionada por la Secretaría de Defensa del Consumidor. Monto de multa: ${montoStr}.`;

      results.push({
        expediente_id,
        hechos,
        ratio_decidendi,
        probabilidad_exito: 0.75, // sanción impuesta = el consumidor/estado ganó
        duracion_dias: 0,
        pais: "AR",
        categoria: inferCategoria(infraccion, empresa),
        tribunal: "Secretaría de Defensa del Consumidor",
        fecha_resolucion: parseExcelDate(fecha),
        url_fuente: XLSX_URL,
        texto_crudo,
        normalizado_por_ia: false,
      });
    } catch {
      // Skip malformed rows
    }
  }

  console.log(`[AR-Sanciones] ${results.length} registros extraídos`);
  return results;
}
