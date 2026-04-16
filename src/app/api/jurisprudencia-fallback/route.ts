/**
 * GET /api/jurisprudencia-fallback?pais=AR|MX
 *
 * Server-side fallback endpoint used by client components when Pinecone
 * returns no results. Returns all normalized cases for a given country.
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY (admin client)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import type { JurisprudenciaCase } from "@/lib/types";

const querySchema = z.object({
  pais: z.enum(["AR", "MX"]),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;

  const result = querySchema.safeParse({ pais: searchParams.get("pais") });
  if (!result.success) {
    return NextResponse.json(
      { error: 'Query param "pais" must be "AR" or "MX".' },
      { status: 400 }
    );
  }

  const { pais } = result.data;

  const { data, error } = await supabase
    .from("jurisprudencia_cases")
    .select(
      "expediente_id, hechos, ratio_decidendi, probabilidad_exito, duracion_dias, pais"
    )
    .eq("pais", pais)
    .eq("normalizado_por_ia", true)
    .gt("probabilidad_exito", 0)
    .order("probabilidad_exito", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[jurisprudencia-fallback] Supabase error:", error.message);
    return NextResponse.json(
      { error: "Error al cargar jurisprudencia." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { cases: (data ?? []) as JurisprudenciaCase[] },
    { status: 200 }
  );
}
