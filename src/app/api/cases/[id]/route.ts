import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  createInAppNotification,
  buildStatusChangeNotification,
} from "@/lib/notifications";

import { updateSchema, updateCaseById } from "@/lib/cases-utils";

// PATCH: Update case status or fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`cases-patch:${ip}`, {
    limit: 20,
    windowSeconds: 60,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta en ${resetIn}s.` },
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

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud invalido." },
      { status: 400 }
    );
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const result = await updateCaseById(id, userId, parsed.data);

  if (result.error === "forbidden") {
    return NextResponse.json(
      { error: "No tienes permiso para modificar este caso." },
      { status: 403 }
    );
  }

  if (result.error === "db_error") {
    return NextResponse.json(
      { error: "Error al actualizar el caso." },
      { status: 500 }
    );
  }

  // Fire-and-forget: create in-app notification on status change
  if (parsed.data.status && result.data) {
    const caseRow = result.data as { empresa?: string | null };
    const { titulo, mensaje } = buildStatusChangeNotification(
      parsed.data.status,
      caseRow.empresa ?? null
    );
    void createInAppNotification({
      userId,
      caseId: id,
      tipo: "status_change",
      titulo,
      mensaje,
    });
  }

  return NextResponse.json(result.data);
}
