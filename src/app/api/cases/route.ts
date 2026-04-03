import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

// POST: Create a new case after AI analysis
export async function POST(request: NextRequest) {
  const { userId } = await auth();
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
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// GET: Retrieve a single case by id, or list all cases for the current user
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  const caseId = request.nextUrl.searchParams.get("id");

  // Single case lookup
  if (caseId) {
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

  // List all cases for the authenticated user
  if (!userId) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para ver tus casos." },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("cases")
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
