import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ limit: () => ({ single: () => ({ data: null }) }) }) }),
    }),
  },
}));

import { normalizeEmpresaName, extractCompanyFromEmail, emailMatchesCompany } from "@/lib/empresa";

describe("normalizeEmpresaName", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmpresaName("  Telmex  ")).toBe("telmex");
  });

  it("strips legal suffixes", () => {
    expect(normalizeEmpresaName("MercadoLibre S.A.")).toBe("mercadolibre");
    expect(normalizeEmpresaName("Telecom S.R.L.")).toBe("telecom");
    expect(normalizeEmpresaName("Empresa S.A.S.")).toBe("empresa");
  });

  it("strips country names", () => {
    expect(normalizeEmpresaName("BBVA Argentina")).toBe("bbva");
    expect(normalizeEmpresaName("Amazon México")).toBe("amazon");
  });

  it("strips punctuation", () => {
    expect(normalizeEmpresaName("AT&T (México)")).toBe("at&t");
  });

  it("normalizes whitespace", () => {
    // After removing stopwords (de, la), extra spaces remain then get trimmed
    const result = normalizeEmpresaName("Banco   de   la   Nación");
    expect(result).toContain("banco");
    expect(result).toContain("nación");
    expect(result).not.toContain("de");
    expect(result).not.toContain("la");
  });

  it("handles empty string", () => {
    expect(normalizeEmpresaName("")).toBe("");
  });

  it("handles S. de C.V. suffix (Mexico)", () => {
    const result = normalizeEmpresaName("Empresa S. de C.V.");
    expect(result).not.toContain("c.v.");
  });
});

describe("extractCompanyFromEmail", () => {
  it("extracts company name from corporate email", () => {
    expect(extractCompanyFromEmail("juan@telmex.com.mx")).toBe("telmex");
    expect(extractCompanyFromEmail("ana@mercadolibre.com")).toBe("mercadolibre");
    expect(extractCompanyFromEmail("rh@bbva.com.ar")).toBe("bbva");
  });

  it("returns null for generic providers", () => {
    expect(extractCompanyFromEmail("user@gmail.com")).toBeNull();
    expect(extractCompanyFromEmail("user@hotmail.com")).toBeNull();
    expect(extractCompanyFromEmail("user@outlook.com")).toBeNull();
    expect(extractCompanyFromEmail("user@yahoo.com")).toBeNull();
    expect(extractCompanyFromEmail("user@protonmail.com")).toBeNull();
  });

  it("returns null for invalid emails", () => {
    expect(extractCompanyFromEmail("noemail")).toBeNull();
    expect(extractCompanyFromEmail("")).toBeNull();
  });

  it("handles subdomains by taking first part", () => {
    expect(extractCompanyFromEmail("info@personal.com.ar")).toBe("personal");
  });
});

describe("emailMatchesCompany", () => {
  it("returns true when email domain matches company name", () => {
    expect(emailMatchesCompany("juan@telmex.com.mx", "Telmex S.A. de C.V.")).toBe(true);
    expect(emailMatchesCompany("ana@mercadolibre.com", "MercadoLibre")).toBe(true);
  });

  it("returns false for generic email providers", () => {
    expect(emailMatchesCompany("user@gmail.com", "Mi Tienda")).toBe(false);
    expect(emailMatchesCompany("user@hotmail.com", "Hotmail Corp")).toBe(false);
  });

  it("returns false when domain does not match company", () => {
    expect(emailMatchesCompany("user@amazon.com", "Telmex")).toBe(false);
  });

  it("returns false for invalid email", () => {
    expect(emailMatchesCompany("not-an-email", "Telmex")).toBe(false);
    expect(emailMatchesCompany("", "Telmex")).toBe(false);
  });

  it("matches partial domain in normalized name", () => {
    expect(emailMatchesCompany("user@bbva.com.ar", "BBVA Argentina")).toBe(true);
  });
});
