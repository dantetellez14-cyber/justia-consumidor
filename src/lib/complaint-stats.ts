/**
 * Complaint statistics service.
 *
 * Queries Supabase for historical complaint data from PROFECO (MX)
 * and Defensa del Consumidor (AR). Includes a PROFECO API client
 * for future live sync when the API comes back online.
 */

import { supabase } from "./supabase";

// ── Types ──

export interface CompanyStats {
  readonly empresa: string;
  readonly sector: string;
  readonly pais: string;
  readonly total_quejas: number;
  readonly quejas_conciliadas: number;
  readonly quejas_no_conciliadas: number;
  readonly monto_promedio_reclamado: number | null;
  readonly monto_promedio_recuperado: number | null;
  readonly tasa_resolucion: number | null;
  readonly periodo: string;
  readonly fuente: string;
}

export interface SectorStats {
  readonly sector: string;
  readonly pais: string;
  readonly total_quejas: number;
  readonly tasa_resolucion_promedio: number | null;
  readonly duracion_promedio_dias: number | null;
  readonly empresa_mas_reclamada: string | null;
  readonly periodo: string;
}

export interface ComplaintStatsResult {
  readonly company: CompanyStats | null;
  readonly similarCompanies: ReadonlyArray<CompanyStats>;
  readonly sectorStats: SectorStats | null;
}

// ── Normalize company name for fuzzy matching ──

function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,\-()]/g, "")
    .replace(/\b(s\.?a\.?|s\.?r\.?l\.?|s\.?a\.?s\.?|s\.? de c\.?v\.?)\b/gi, "")
    .replace(/\b(argentina|méxico|mexico|de|del|la|el|los|las)\b/gi, "")
    .trim();
}

// ── Map form categories to DB sectors ──

const CATEGORY_TO_SECTOR: Record<string, string> = {
  electronica: "Electrónica",
  electrodomesticos: "Electrónica",
  telecomunicaciones: "Telecomunicaciones",
  servicios_financieros: "Servicios financieros",
  comercio_electronico: "Comercio electrónico",
  transporte: "Transporte aéreo",
  automotriz: "Automotriz",
  servicios_publicos: "Servicios públicos",
  salud: "Salud y medicina prepaga",
  educacion: "Educación",
  inmobiliaria: "Inmobiliaria",
  alimentos: "Alimentos",
  indumentaria: "Comercio",
  turismo: "Turismo",
  otro: "Otro",
};

export function mapCategoryToSector(category: string): string {
  return CATEGORY_TO_SECTOR[category] ?? category;
}

// ── Query functions ──

export async function findCompanyStats(
  empresa: string,
  pais: "AR" | "MX"
): Promise<CompanyStats | null> {
  const normalized = normalizeCompanyName(empresa);
  if (!normalized) return null;

  // Try exact normalized match first
  const { data } = await supabase
    .from("complaint_stats")
    .select("*")
    .eq("pais", pais)
    .ilike("empresa_normalizada", `%${normalized}%`)
    .order("total_quejas", { ascending: false })
    .limit(1);

  if (data && data.length > 0) {
    return data[0] as CompanyStats;
  }

  // Try partial match with first significant word
  const words = normalized.split(" ").filter((w) => w.length > 2);
  if (words.length === 0) return null;

  const { data: partial } = await supabase
    .from("complaint_stats")
    .select("*")
    .eq("pais", pais)
    .ilike("empresa_normalizada", `%${words[0]}%`)
    .order("total_quejas", { ascending: false })
    .limit(1);

  return partial && partial.length > 0 ? (partial[0] as CompanyStats) : null;
}

export async function findSimilarCompanies(
  sector: string,
  pais: "AR" | "MX",
  excludeEmpresa?: string
): Promise<ReadonlyArray<CompanyStats>> {
  let query = supabase
    .from("complaint_stats")
    .select("*")
    .eq("pais", pais)
    .ilike("sector", `%${sector}%`)
    .order("total_quejas", { ascending: false })
    .limit(5);

  if (excludeEmpresa) {
    query = query.not(
      "empresa_normalizada",
      "ilike",
      `%${normalizeCompanyName(excludeEmpresa)}%`
    );
  }

  const { data } = await query;
  return (data ?? []) as CompanyStats[];
}

export async function findSectorStats(
  sector: string,
  pais: "AR" | "MX"
): Promise<SectorStats | null> {
  const { data } = await supabase
    .from("sector_stats")
    .select("*")
    .eq("pais", pais)
    .ilike("sector", `%${sector}%`)
    .order("total_quejas", { ascending: false })
    .limit(1);

  return data && data.length > 0 ? (data[0] as SectorStats) : null;
}

/**
 * Main entry point: get all complaint statistics for a company + sector.
 */
export async function getComplaintStats(
  empresa: string,
  sector: string,
  pais: "AR" | "MX"
): Promise<ComplaintStatsResult> {
  const [company, similarCompanies, sectorStats] = await Promise.all([
    findCompanyStats(empresa, pais),
    findSimilarCompanies(sector, pais, empresa),
    findSectorStats(sector, pais),
  ]);

  return { company, similarCompanies, sectorStats };
}

// ── PROFECO API Client (for future live sync) ──

const PROFECO_API_BASE = "https://datos.profeco.gob.mx/quejas";

interface ProfecoQueryParams {
  readonly SECTOR?: string;
  readonly PROVEEDOR?: string;
  readonly ESTADO_PROCESAL?: string;
  readonly inicio?: string;
  readonly fin?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

interface ProfecoResponse {
  readonly data: ReadonlyArray<Record<string, unknown>>;
  readonly pagination: {
    readonly total: number;
    readonly page: number;
    readonly pageSize: number;
  };
}

/**
 * Query the PROFECO complaints API.
 * Currently returns null because the API is returning 500 errors.
 * Ready to use when the API comes back online.
 */
export async function queryProfecoApi(
  params: ProfecoQueryParams
): Promise<ProfecoResponse | null> {
  const url = new URL(`${PROFECO_API_BASE}/consulta.php`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  try {
    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return null;
    }

    return (await response.json()) as ProfecoResponse;
  } catch {
    // API is currently down — return null silently
    return null;
  }
}

/**
 * Fetch PROFECO catalog values (sectors, motives, etc.)
 */
export async function fetchProfecoCatalog(
  catalogName: string
): Promise<ReadonlyArray<string> | null> {
  try {
    const response = await fetch(
      `${PROFECO_API_BASE}/catalogo.php?catalogo=${catalogName}&pageSize=500`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return null;

    const data = await response.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}
