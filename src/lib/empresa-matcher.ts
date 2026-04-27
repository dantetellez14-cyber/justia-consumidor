import { supabase } from "@/lib/supabase";
import { normalizeEmpresaName } from "@/lib/empresa";

export interface CompanyMatch {
  readonly companyId: string;
  readonly companyName: string;
}

/** Escape LIKE/ILIKE wildcards so user input cannot widen the pattern. */
function escapeLike(input: string): string {
  return input.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/**
 * Look up a registered company by the empresa name from a consumer case.
 * Returns the matched company_accounts.id, or null if no match.
 */
export async function findCompanyByName(
  empresaName: string | null | undefined
): Promise<CompanyMatch | null> {
  if (!empresaName) return null;

  const normalized = normalizeEmpresaName(empresaName);
  if (!normalized) return null;

  // Use the first significant word (≥4 chars) for the ilike search
  const keywordRaw = normalized.split(" ").find((w) => w.length >= 4) ?? normalized.split(" ")[0];
  if (!keywordRaw) return null;
  const keyword = escapeLike(keywordRaw);

  const { data: companies } = await supabase
    .from("company_accounts")
    .select("id, nombre, nombre_normalizado")
    .ilike("nombre_normalizado", `%${keyword}%`)
    .limit(10);

  if (!companies || companies.length === 0) return null;

  // Best-match against the already-normalized column
  for (const company of companies) {
    const id = company.id as string | null;
    const nombre = company.nombre as string | null;
    const compNorm = (company.nombre_normalizado as string | null) ?? "";
    if (!id || !nombre || !compNorm) continue;

    if (compNorm === normalized || compNorm.includes(normalized) || normalized.includes(compNorm)) {
      return { companyId: id, companyName: nombre };
    }
  }

  return null;
}
