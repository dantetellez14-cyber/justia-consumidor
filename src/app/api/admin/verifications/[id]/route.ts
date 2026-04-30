/**
 * POST /api/admin/verifications/[id]
 *
 * Approve or reject a manual verification request. Admin-only.
 * Body: { action: "approve" | "reject", notes?: string }
 *
 * On approve: marks the company verificada=true, links the requester as
 * admin if not already linked, sets reviewed_by/at on the request.
 * On reject: only updates the request row.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  approveVerificationRequest,
  rejectVerificationRequest,
} from "@/lib/empresa";
import { logError, createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/admin/verifications/[id]");

function isAdminUser(userId: string): boolean {
  const adminIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return adminIds.includes(userId);
}

const bodySchema = z
  .object({
    action: z.enum(["approve", "reject"]),
    notes: z.string().max(2000, "Notas demasiado largas").optional(),
  })
  .strict();

const idSchema = z.string().uuid("ID de solicitud invalido");

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`admin-verify-action:${ip}`, {
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

  const { id } = await context.params;
  const idResult = idSchema.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json(
      { error: idResult.error.issues[0]?.message ?? "ID invalido." },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo invalido." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  try {
    if (parsed.data.action === "approve") {
      const { company_id } = await approveVerificationRequest({
        requestId: id,
        adminClerkId: userId,
        notes: parsed.data.notes,
      });
      log.info({ requestId: id, companyId: company_id, action: "approve" }, "Verification approved");
      return NextResponse.json({ approved: true, company_id });
    }

    await rejectVerificationRequest({
      requestId: id,
      adminClerkId: userId,
      notes: parsed.data.notes,
    });
    log.info({ requestId: id, action: "reject" }, "Verification rejected");
    return NextResponse.json({ rejected: true });
  } catch (err) {
    logError("verification action failed", err, {
      route: "/api/admin/verifications/[id]",
      requestId: id,
      action: parsed.data.action,
    });
    const message = err instanceof Error ? err.message : "Error procesando accion.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
