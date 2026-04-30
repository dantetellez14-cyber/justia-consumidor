/**
 * GET /api/admin/verifications
 *
 * List pending manual verification requests. Admin-only.
 * Auth: Clerk userId must be in ADMIN_USER_IDS (comma-separated).
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { listPendingVerificationRequests } from "@/lib/empresa";
import { supabase } from "@/lib/supabase";
import { logError, createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/admin/verifications");

function isAdminUser(userId: string): boolean {
  const adminIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return adminIds.includes(userId);
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`admin-verifications:${ip}`, {
    limit: 30,
    windowSeconds: 60,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta en ${resetIn}s.` },
      { status: 429 }
    );
  }

  const { userId } = await auth();
  if (!userId || !isAdminUser(userId)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  try {
    const requests = await listPendingVerificationRequests();

    if (requests.length === 0) {
      return NextResponse.json({ requests: [] });
    }

    // Hydrate with company name + nombre_normalizado for the admin UI.
    const companyIds = Array.from(new Set(requests.map((r) => r.company_id)));
    const { data: companies } = await supabase
      .from("company_accounts")
      .select("id, nombre, nombre_normalizado, pais, sector")
      .in("id", companyIds);

    const byId = new Map(
      (companies ?? []).map(
        (c: Record<string, unknown>) => [c.id as string, c] as const
      )
    );

    const hydrated = requests.map((r) => ({
      ...r,
      company: byId.get(r.company_id) ?? null,
    }));

    return NextResponse.json({ requests: hydrated });
  } catch (err) {
    logError("Listing verifications failed", err, {
      route: "/api/admin/verifications",
    });
    return NextResponse.json(
      { error: "Error al listar solicitudes." },
      { status: 500 }
    );
  }
}
