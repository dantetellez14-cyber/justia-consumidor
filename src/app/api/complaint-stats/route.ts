import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getComplaintStats, mapCategoryToSector } from "@/lib/complaint-stats";
import { calculateReputationScore } from "@/lib/reputation-score";
import { logError, createRouteLogger } from "@/lib/logger";

const log = createRouteLogger("/api/complaint-stats");

const querySchema = z.object({
  empresa: z.string().min(1, "Empresa es requerida"),
  sector: z.string().optional().default(""),
  categoria: z.string().optional().default(""),
  pais: z.enum(["AR", "MX"]).optional().default("AR"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limit: 30 requests per minute per IP
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`complaint-stats:${ip}`, {
    limit: 30,
    windowSeconds: 60,
  });

  if (!allowed) {
    return NextResponse.json(
      {
        error: `Demasiadas solicitudes. Intenta de nuevo en ${resetIn} segundos.`,
      },
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

  const parsed = querySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { empresa, sector, categoria, pais } = parsed.data;

  // Resolve sector from category if not provided directly
  const resolvedSector = sector || mapCategoryToSector(categoria);

  try {
    const stats = await getComplaintStats(empresa, resolvedSector, pais);

    log.info(
      {
        empresa,
        sector: resolvedSector,
        pais,
        found: !!stats.company,
      },
      "Complaint stats queried"
    );

    // Calculate reputation score if we have company data
    const reputationScore = stats.company
      ? calculateReputationScore(stats.company, stats.sectorStats)
      : null;

    return NextResponse.json({ ...stats, reputationScore });
  } catch (err) {
    logError("Complaint stats query error", err, {
      route: "/api/complaint-stats",
    });
    return NextResponse.json(
      { error: "Error al consultar estadísticas." },
      { status: 500 }
    );
  }
}
