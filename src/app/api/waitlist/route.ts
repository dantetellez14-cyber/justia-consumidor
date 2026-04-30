import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabase } from "@/lib/supabase";
import { waitlistSchema, formatZodError } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST: Add an email to the pre-launch waitlist
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`waitlist:${ip}`, {
    limit: 5,
    windowSeconds: 60,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intentá en ${resetIn} segundos.` },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido." },
      { status: 400 }
    );
  }

  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? null;
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 32);

  const { error } = await supabase.from("waitlist").insert({
    email: parsed.data.email.toLowerCase().trim(),
    pais: parsed.data.pais,
    source: parsed.data.source ?? null,
    user_agent: userAgent,
    ip_hash: ipHash,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, alreadyRegistered: true });
    }
    return NextResponse.json(
      { error: "No pudimos registrarte. Probá de nuevo en un momento." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

// GET: Public count of people on the waitlist
export async function GET() {
  const { count, error } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ count: 0 });
  }

  return NextResponse.json({ count: count ?? 0 });
}
