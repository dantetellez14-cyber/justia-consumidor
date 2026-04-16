/**
 * jurisprudencia.ts
 * Client-safe helpers for accessing jurisprudencia data.
 *
 * fetchCasesByCountry() calls the server-side API route
 * (/api/jurisprudencia-fallback) which reads from Supabase.
 * Safe to call from "use client" components.
 */

import type { JurisprudenciaCase } from "./types";

/**
 * Fetches normalized jurisprudencia cases for a country.
 * Used as a Pinecone fallback in client components.
 *
 * @param pais  "AR" | "MX"
 * @returns Array of up to 20 cases ordered by probabilidad_exito desc
 */
export async function fetchCasesByCountry(
  pais: "AR" | "MX"
): Promise<ReadonlyArray<JurisprudenciaCase>> {
  const res = await fetch(`/api/jurisprudencia-fallback?pais=${pais}`);

  if (!res.ok) {
    // Non-critical path — return empty rather than crashing the UI
    console.error(
      `[jurisprudencia] fetchCasesByCountry failed: ${res.status} ${res.statusText}`
    );
    return [];
  }

  const data = (await res.json()) as { cases: JurisprudenciaCase[] };
  return data.cases ?? [];
}
