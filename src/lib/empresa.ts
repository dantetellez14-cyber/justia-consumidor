/**
 * Company (Empresa) service layer.
 *
 * Handles company account management, complaint retrieval,
 * response submission, and dashboard statistics.
 */

import { supabase } from "./supabase";

// ── Types ──

export interface CompanyAccount {
  readonly id: string;
  readonly nombre: string;
  readonly nombre_normalizado: string;
  readonly rfc: string | null;
  readonly cuit: string | null;
  readonly sector: string | null;
  readonly pais: "AR" | "MX";
  readonly email_contacto: string | null;
  readonly telefono: string | null;
  readonly domicilio: string | null;
  readonly logo_url: string | null;
  readonly activa: boolean;
  readonly created_at: string;
  readonly updated_at: string;
  readonly verificada: boolean;
  readonly verificada_por: string | null;
  readonly verificada_at: string | null;
}

export interface CompanyUser {
  readonly id: string;
  readonly clerk_user_id: string;
  readonly company_id: string;
  readonly rol: "admin" | "operador" | "lectura";
  readonly created_at: string;
  readonly email_verificado: boolean;
}

export interface CompanyResponse {
  readonly id: string;
  readonly case_id: string;
  readonly company_id: string;
  readonly respondido_por: string;
  readonly tipo_respuesta: "aceptar" | "rechazar" | "propuesta" | "solicitar_info";
  readonly mensaje: string;
  readonly propuesta_monto: number | null;
  readonly created_at: string;
}

export interface CompanyCaseView {
  readonly id: string;
  readonly empresa: string | null;
  readonly producto_servicio: string | null;
  readonly monto_reclamo: number | null;
  readonly fecha_incidente: string | null;
  readonly core_grievance: string | null;
  readonly probabilidad_exito: number | null;
  readonly pais_detectado: "AR" | "MX" | null;
  readonly status: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly complaint_generated: boolean;
  readonly arbitration_completed: boolean;
  readonly relato: string;
  readonly responses: ReadonlyArray<CompanyResponse>;
}

export interface CompanyDashboardStats {
  readonly totalReclamos: number;
  readonly pendientes: number;
  readonly respondidos: number;
  readonly resueltos: number;
  readonly montoTotalReclamado: number;
  readonly montoPromedioReclamado: number;
  readonly tasaRespuesta: number;
}

// ── Normalize for fuzzy matching ──

export function normalizeEmpresaName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,\-()]/g, "")
    .replace(/\b(s\.?a\.?|s\.?r\.?l\.?|s\.?a\.?s\.?|s\.? de c\.?v\.?)\b/gi, "")
    .replace(/\b(argentina|méxico|mexico|de|del|la|el|los|las)\b/gi, "")
    .trim();
}

// ── Email domain extraction ──

/**
 * Extract the company-relevant portion from an email domain.
 * "juan@telmex.com.mx" → "telmex"
 * "ana@mercadolibre.com" → "mercadolibre"
 * Strips generic providers (gmail, outlook, yahoo, hotmail, etc.)
 */
const GENERIC_EMAIL_PROVIDERS = new Set([
  "gmail", "googlemail", "outlook", "hotmail", "live", "msn",
  "yahoo", "ymail", "aol", "icloud", "me", "mac", "protonmail",
  "proton", "zoho", "tutanota", "fastmail", "mail",
]);

export function extractCompanyFromEmail(email: string): string | null {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;

  // "telmex.com.mx" → ["telmex", "com", "mx"]
  const parts = domain.split(".");
  const candidate = parts[0];

  if (!candidate || GENERIC_EMAIL_PROVIDERS.has(candidate)) return null;

  return candidate;
}

/**
 * Check if a user's email domain matches a company name.
 * Used to verify corporate email ownership.
 */
export function emailMatchesCompany(email: string, companyName: string): boolean {
  const domain = extractCompanyFromEmail(email);
  if (!domain) return false;

  const normalized = normalizeEmpresaName(companyName);
  return normalized.includes(domain);
}

/**
 * Find a registered company account whose normalized name matches the email domain.
 */
export async function findCompanyByEmailDomain(
  email: string
): Promise<CompanyAccount | null> {
  const candidate = extractCompanyFromEmail(email);
  if (!candidate) return null;

  const { data } = await supabase
    .from("company_accounts")
    .select("*")
    .eq("activa", true)
    .ilike("nombre_normalizado", `%${candidate}%`)
    .limit(1)
    .single();

  return data as CompanyAccount | null;
}

/**
 * Find complaints in the cases table matching the email domain.
 * Returns the empresa name and count.
 */
export async function findCasesByEmailDomain(
  email: string
): Promise<{ empresaName: string; count: number } | null> {
  const candidate = extractCompanyFromEmail(email);
  if (!candidate) return null;

  const { data: cases } = await supabase
    .from("cases")
    .select("empresa")
    .ilike("empresa", `%${candidate}%`);

  if (!cases || cases.length === 0) return null;

  // Get the most common empresa name variant
  const nameCount = new Map<string, number>();
  for (const c of cases) {
    const name = (c as { empresa: string | null }).empresa;
    if (name) {
      nameCount.set(name, (nameCount.get(name) ?? 0) + 1);
    }
  }

  let bestName = "";
  let bestCount = 0;
  for (const [name, count] of nameCount) {
    if (count > bestCount) {
      bestName = name;
      bestCount = count;
    }
  }

  if (!bestName) return null;

  return { empresaName: bestName, count: cases.length };
}

/**
 * Link an existing Clerk user to an existing company account.
 * Used when auto-detection identifies the user's company.
 */
export async function linkUserToCompany(
  clerkUserId: string,
  companyId: string,
  rol: CompanyUser["rol"] = "operador"
): Promise<void> {
  const { error } = await supabase.from("company_users").insert({
    clerk_user_id: clerkUserId,
    company_id: companyId,
    rol,
  });

  if (error) throw new Error(`Error vinculando usuario: ${error.message}`);
}

// ── Company account operations ──

/**
 * Get the company account linked to a Clerk user.
 */
export async function getCompanyForUser(
  clerkUserId: string
): Promise<{ account: CompanyAccount; role: CompanyUser["rol"] } | null> {
  const { data: link } = await supabase
    .from("company_users")
    .select("company_id, rol")
    .eq("clerk_user_id", clerkUserId)
    .limit(1)
    .single();

  if (!link) return null;

  const { data: account } = await supabase
    .from("company_accounts")
    .select("*")
    .eq("id", link.company_id)
    .eq("activa", true)
    .single();

  if (!account) return null;

  return {
    account: account as CompanyAccount,
    role: link.rol as CompanyUser["rol"],
  };
}

/**
 * Register a new company account and link the creating user as admin.
 */
export async function registerCompany(
  clerkUserId: string,
  data: {
    nombre: string;
    rfc?: string;
    cuit?: string;
    sector?: string;
    pais: "AR" | "MX";
    email_contacto?: string;
    telefono?: string;
    domicilio?: string;
  }
): Promise<CompanyAccount> {
  const normalized = normalizeEmpresaName(data.nombre);

  const { data: account, error } = await supabase
    .from("company_accounts")
    .insert({
      nombre: data.nombre,
      nombre_normalizado: normalized,
      rfc: data.rfc ?? null,
      cuit: data.cuit ?? null,
      sector: data.sector ?? null,
      pais: data.pais,
      email_contacto: data.email_contacto ?? null,
      telefono: data.telefono ?? null,
      domicilio: data.domicilio ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Error creando empresa: ${error.message}`);

  // Link user as admin
  await supabase.from("company_users").insert({
    clerk_user_id: clerkUserId,
    company_id: account.id,
    rol: "admin",
  });

  return account as CompanyAccount;
}

// ── Complaint retrieval for companies ──

/**
 * Get all complaints filed against this company.
 * Matches by normalized company name.
 */
export async function getCompanyComplaints(
  company: CompanyAccount
): Promise<ReadonlyArray<CompanyCaseView>> {
  const normalized = company.nombre_normalizado;
  const words = normalized.split(" ").filter((w) => w.length > 2);
  const searchPattern = words.length > 0 ? `%${words[0]}%` : `%${normalized}%`;

  // Get cases matching this company name
  const { data: cases } = await supabase
    .from("cases")
    .select("*")
    .ilike("empresa", searchPattern)
    .order("created_at", { ascending: false });

  if (!cases || cases.length === 0) return [];

  const caseIds = cases.map((c: Record<string, unknown>) => c.id as string);

  // Get all responses for these cases
  const { data: responses } = await supabase
    .from("company_responses")
    .select("*")
    .in("case_id", caseIds)
    .order("created_at", { ascending: true });

  const responseMap = new Map<string, CompanyResponse[]>();
  for (const r of (responses ?? []) as CompanyResponse[]) {
    const existing = responseMap.get(r.case_id) ?? [];
    responseMap.set(r.case_id, [...existing, r]);
  }

  return cases.map((c: Record<string, unknown>) => ({
    ...(c as Omit<CompanyCaseView, "responses">),
    responses: responseMap.get(c.id as string) ?? [],
  }));
}

/**
 * Get a single complaint by ID (for company detail view).
 */
export async function getComplaintById(
  caseId: string,
  companyId: string
): Promise<CompanyCaseView | null> {
  const { data: caseData } = await supabase
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .single();

  if (!caseData) return null;

  const { data: responses } = await supabase
    .from("company_responses")
    .select("*")
    .eq("case_id", caseId)
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });

  return {
    ...(caseData as Omit<CompanyCaseView, "responses">),
    responses: (responses ?? []) as CompanyResponse[],
  };
}

// ── Company responses ──

/**
 * Submit a response to a consumer complaint.
 */
export async function submitResponse(
  caseId: string,
  companyId: string,
  clerkUserId: string,
  data: {
    tipo_respuesta: CompanyResponse["tipo_respuesta"];
    mensaje: string;
    propuesta_monto?: number;
  }
): Promise<CompanyResponse> {
  const { data: response, error } = await supabase
    .from("company_responses")
    .insert({
      case_id: caseId,
      company_id: companyId,
      respondido_por: clerkUserId,
      tipo_respuesta: data.tipo_respuesta,
      mensaje: data.mensaje,
      propuesta_monto: data.propuesta_monto ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Error enviando respuesta: ${error.message}`);

  // Update case status
  const newStatus =
    data.tipo_respuesta === "aceptar"
      ? "resuelto"
      : "en_mediacion";

  await supabase
    .from("cases")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", caseId);

  return response as CompanyResponse;
}

// ── Dashboard stats ──

/**
 * Calculate dashboard statistics for a company.
 */
export async function getCompanyDashboardStats(
  company: CompanyAccount
): Promise<CompanyDashboardStats> {
  const complaints = await getCompanyComplaints(company);

  const totalReclamos = complaints.length;
  const respondidos = complaints.filter((c) => c.responses.length > 0).length;
  const resueltos = complaints.filter((c) => c.status === "resuelto").length;
  const pendientes = totalReclamos - respondidos;

  const montos = complaints
    .map((c) => c.monto_reclamo)
    .filter((m): m is number => m !== null);
  const montoTotalReclamado = montos.reduce((sum, m) => sum + m, 0);
  const montoPromedioReclamado =
    montos.length > 0 ? montoTotalReclamado / montos.length : 0;

  const tasaRespuesta =
    totalReclamos > 0 ? respondidos / totalReclamos : 0;

  return {
    totalReclamos,
    pendientes,
    respondidos,
    resueltos,
    montoTotalReclamado,
    montoPromedioReclamado,
    tasaRespuesta,
  };
}
