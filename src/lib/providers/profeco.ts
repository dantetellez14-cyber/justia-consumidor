/**
 * PROFECO data provider.
 *
 * Streams the PROFECO open-data CSV (~144 MB) line-by-line without loading
 * the entire file into memory, normalises each record to JurisprudenciaCase,
 * and returns only the records that pass optional filters.
 */

import type { JurisprudenciaCase } from "@/lib/types";
import { logError } from "@/lib/logger";

// ── Constants ────────────────────────────────────────────────────────────────

const PROFECO_CSV_URL =
  "https://datos.profeco.gob.mx/datos_abiertos/file.php?t=9b662fb8f81e9eb645e4e773379da159";

const SKIP_ESTADOS = new Set(["Cancelada", "Capturada"]);

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parse a single CSV line respecting quoted fields.
 * Handles commas inside double-quoted fields.
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote inside a quoted field
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }

  fields.push(current.trim());
  return fields;
}

/**
 * Map estado_procesal → probabilidad_exito (0–1).
 */
function mapProbabilidad(estado: string): number {
  switch (estado) {
    case "Conciliada":
      return 0.75;
    case "No Conciliada":
      return 0.25;
    case "Desistimiento":
      return 0.45;
    default:
      return 0.5;
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface ProfecoFilters {
  /** Company name substring match (case-insensitive) */
  empresa?: string;
  /** Sector substring match (case-insensitive) */
  sector?: string;
  /** Complaint reason substring match (case-insensitive) */
  motivo?: string;
  /** Only include records on or after this date (YYYY/MM/DD) */
  since?: string;
  /** Maximum number of records to return */
  limit?: number;
}

// ── Main export ──────────────────────────────────────────────────────────────

/**
 * Stream the PROFECO CSV and return normalised JurisprudenciaCase records.
 *
 * Uses ReadableStream line-by-line parsing so the 144 MB file is never
 * fully loaded into memory.
 */
export async function streamProfecoData(
  filters: ProfecoFilters = {}
): Promise<JurisprudenciaCase[]> {
  const { empresa, sector, motivo, since, limit = 500 } = filters;

  const empresaLower = empresa?.toLowerCase();
  const sectorLower = sector?.toLowerCase();
  const motivoLower = motivo?.toLowerCase();

  let response: Response;
  try {
    response = await fetch(PROFECO_CSV_URL);
  } catch (err) {
    logError("PROFECO fetch failed", err, { url: PROFECO_CSV_URL });
    throw new Error("No se pudo conectar con la fuente de datos PROFECO.");
  }

  if (!response.ok) {
    throw new Error(`PROFECO HTTP ${response.status}`);
  }

  if (!response.body) {
    throw new Error("PROFECO response has no body.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  const cases: JurisprudenciaCase[] = [];

  // Column index map — filled once the header row is parsed
  const headerMap: Record<string, number> = {};
  let headerParsed = false;
  let buffer = "";

  const processLine = (rawLine: string): void => {
    // Strip UTF-8 BOM if present on the very first line
    const line = rawLine.replace(/^\uFEFF/, "");
    if (!line) return;

    const fields = parseCsvLine(line);

    if (!headerParsed) {
      fields.forEach((col, idx) => {
        headerMap[col.toLowerCase().replace(/\s+/g, "_")] = idx;
      });
      headerParsed = true;
      return;
    }

    const get = (col: string): string =>
      fields[headerMap[col] ?? -1]?.trim() ?? "";

    const estado = get("estado_procesal");
    if (SKIP_ESTADOS.has(estado)) return;

    const fechaIngreso = get("fecha_ingreso");
    if (since && fechaIngreso && fechaIngreso < since) return;

    const nombreComercial = get("nombre_comercial");
    const sectorVal = get("sector");
    const motivoReclamacion = get("motivo_reclamacion");

    // Apply optional filters
    if (empresaLower && !nombreComercial.toLowerCase().includes(empresaLower))
      return;
    if (sectorLower && !sectorVal.toLowerCase().includes(sectorLower)) return;
    if (motivoLower && !motivoReclamacion.toLowerCase().includes(motivoLower))
      return;

    const idExpediente = get("id_expediente");
    const tipoConciliacion = get("tipo_conciliacion");
    const tipoReclamacion = get("tipo_reclamacion");
    const montoReclamado = get("monto_reclamado");
    const razonSocial = get("razon_social");

    const displayEmpresa = nombreComercial || razonSocial || "empresa desconocida";

    const normalized: JurisprudenciaCase = {
      expediente_id: `${idExpediente}_MX`,
      hechos: `${tipoReclamacion}: ${motivoReclamacion} contra ${displayEmpresa} en sector ${sectorVal}`,
      ratio_decidendi: `${estado} mediante ${tipoConciliacion}. Monto reclamado: $${montoReclamado} MXN`,
      probabilidad_exito: mapProbabilidad(estado),
      duracion_dias: 90,
      pais: "MX",
    };

    cases.push(normalized);
  };

  try {
    while (cases.length < limit) {
      const { done, value } = await reader.read();

      if (value) {
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split("\n");
        // Keep the last (possibly incomplete) fragment in the buffer
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (cases.length >= limit) break;
          processLine(line);
        }
      }

      if (done) {
        // Process any remaining content in the buffer
        if (buffer) processLine(buffer);
        break;
      }
    }
  } finally {
    reader.cancel().catch(() => {/* ignore */});
  }

  return cases;
}
