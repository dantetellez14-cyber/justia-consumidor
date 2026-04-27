import { supabase } from "@/lib/supabase";
import { normalizeEmpresaName } from "@/lib/empresa";

export interface CompanyMatch {
  companyId: string;
  companyName: string;
}

/**
 * Look up a registered company by the empresa name from a consumer case.
 * Returns the matched company_accounts.id, or null if no match.
 */
export async function findCompanyByName(
  empresaName: string | null | undefined,
  _pais?: string
): Promise<CompanyMatch | null> {
  if (!empresaName) return null;

  const normalized = normalizeEmpresaName(empresaName);
  if (!normalized) return null;

  // Use the first significant word (≥4 chars) for the ilike search
  const keyword = normalized.split(" ").find((w) => w.length >= 4) ?? normalized.split(" ")[0];
  if (!keyword) return null;

  const { data: companies } = await supabase
    .from("company_accounts")
    .select("id, nombre, nombre_normalizado")
    .ilike("nombre_normalizado", `%${keyword}%`)
    .limit(10);

  if (!companies || companies.length === 0) return null;

  // Find best match: normalized names must overlap
  for (const company of companies) {
    const compNorm = normalizeEmpresaName(company.nombre as string);
    if (compNorm === normalized || compNorm.includes(normalized) || normalized.includes(compNorm)) {
      return { companyId: company.id as string, companyName: company.nombre as string };
    }
  }

  return null;
}
