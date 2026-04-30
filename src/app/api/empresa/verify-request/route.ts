/**
 * POST /api/empresa/verify-request
 *
 * Submit a manual verification request for the requester's currently-linked
 * (but unverified) company. An admin reviews via /api/admin/verifications.
 *
 * Auth: Clerk user must be linked to a company (admin/operador).
 * Rate limit: 3 per hour per IP (low — this is an exceptional flow).
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  getCompanyForUser,
  createVerificationRequest,
} from "@/lib/empresa";
import { logError, createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/empresa/verify-request");

const bodySchema = z
  .object({
    justification: z
      .string()
      .min(20, "Justificacion debe tener al menos 20 caracteres")
      .max(2000, "Justificacion demasiado larga"),
    document_url: z.string().url("URL de documento invalida").optional(),
  })
  .strict();

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`verify-request:${ip}`, {
    limit: 3,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return NextResponse.json(
      {
        error: `Limite de solicitudes alcanzado. Intenta de nuevo en ${Math.ceil(
          resetIn / 60
        )} minutos.`,
      },
      { status: 429 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "Debes iniciar sesion." },
      { status: 401 }
    );
  }

  const company = await getCompanyForUser(userId);
  if (!company) {
    return NextResponse.json(
      { error: "Necesitas vincularte a una empresa antes de solicitar verificacion." },
      { status: 400 }
    );
  }

  if (company.account.verificada) {
    return NextResponse.json(
      { error: "Esta empresa ya esta verificada." },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud invalido." },
      { status: 400 }
    );
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress ?? "";

    const created = await createVerificationRequest({
      clerkUserId: userId,
      email,
      companyId: company.account.id,
      justification: parsed.data.justification,
      documentUrl: parsed.data.document_url ?? null,
    });

    log.info(
      { requestId: created.id, companyId: company.account.id },
      "Verification request submitted"
    );

    return NextResponse.json({
      submitted: true,
      request: {
        id: created.id,
        status: created.status,
        created_at: created.created_at,
      },
    });
  } catch (err) {
    logError("verify-request submission failed", err, {
      route: "/api/empresa/verify-request",
      userId,
    });
    const message = err instanceof Error ? err.message : "Error al enviar solicitud.";
    // 409 if there is an existing pending request, 400 otherwise.
    const status = message.includes("pendiente") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
