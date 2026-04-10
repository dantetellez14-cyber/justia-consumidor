import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { feedbackSchema, formatZodError } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST: Submit feedback
export async function POST(request: NextRequest) {
  // Rate limit: 10 feedback submissions per minute per IP
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`feedback:${ip}`, {
    limit: 10,
    windowSeconds: 60,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta de nuevo en ${resetIn} segundos.` },
      { status: 429 }
    );
  }

  const { userId } = await auth();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido." },
      { status: 400 }
    );
  }

  const parsed = feedbackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      case_id: parsed.data.case_id ?? null,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Error al guardar el feedback." }, { status: 500 });
  }

  return NextResponse.json(data);
}
