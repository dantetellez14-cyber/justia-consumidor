import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST: Create a new case after AI analysis
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("cases")
    .insert({
      relato: body.relato,
      empresa: body.empresa,
      producto_servicio: body.producto_servicio,
      monto_reclamo: body.monto_reclamo,
      fecha_incidente: body.fecha_incidente,
      core_grievance: body.core_grievance,
      probabilidad_exito: body.probabilidad_exito,
      analisis_legal: body.analisis_legal,
      pais_detectado: body.pais_detectado,
      status: "consulta_recibida",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// GET: Retrieve a case by id (via query param)
export async function GET(request: NextRequest) {
  const caseId = request.nextUrl.searchParams.get("id");

  if (!caseId) {
    return NextResponse.json(
      { error: "Case ID is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("cases")
    .select()
    .eq("id", caseId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}
