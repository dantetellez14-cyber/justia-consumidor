import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import {
  createCaseSchema,
  getCaseQuerySchema,
  formatZodError,
} from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST: Create a new case after AI analysis
export async function POST(request: NextRequest) {
  // Rate limit: 20 case creations per minute per IP
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`cases-post:${ip}`, {
    limit: 20,
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

  const parsed = createCaseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("cases")
    .insert({
      ...parsed.data,
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
  // Rate limit: 30 reads per minute per IP
  const ipGet = getClientIp(request);
  const { allowed: allowedGet, resetIn: resetInGet } = await rateLimit(
    `cases-get:${ipGet}`,
    { limit: 30, windowSeconds: 60 }
  );

  if (!allowedGet) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta de nuevo en ${resetInGet} segundos.` },
      { status: 429 }
    );
  }

  const { userId } = await auth();

  const queryParams = {
    id: request.nextUrl.searchParams.get("id") ?? undefined,
  };
  const parsedQuery = getCaseQuerySchema.safeParse(queryParams);

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: formatZodError(parsedQuery.error) },
      { status: 400 }
    );
  }

  const caseId = parsedQuery.data.id;

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
