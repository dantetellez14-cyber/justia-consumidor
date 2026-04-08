import { NextResponse } from "next/server";
import { getPinecone, PINECONE_INDEX_NAME } from "@/lib/pinecone";
import type { JurisprudenciaCase } from "@/lib/types";
import {
  searchJurisprudenciaSchema,
  formatZodError,
} from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";
import { cached } from "@/lib/cache";

const EMBEDDING_MODEL = "multilingual-e5-large";
const TOP_K = 5;

export async function POST(request: Request) {
  // Rate limit: 15 searches per minute per IP
  const ip = getClientIp(request);
  const { allowed, resetIn } = await rateLimit(`search:${ip}`, {
    limit: 15,
    windowSeconds: 60,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta de nuevo en ${resetIn} segundos.` },
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

  const parsed = searchJurisprudenciaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  const { query, pais } = parsed.data;

  if (!process.env.PINECONE_API_KEY) {
    // Fallback: return empty so the app uses the static jurisprudencia list
    return NextResponse.json({ cases: [], source: "static" });
  }

  try {
    // Cache key: normalize query to first 100 chars + country — 24h TTL
    const normalizedQuery = query.toLowerCase().trim().slice(0, 100);
    const cacheKey = `juris:${normalizedQuery}:${pais ?? "all"}`;

    const result = await cached(cacheKey, 86400, async () => {
      const pc = getPinecone();

      const embedResponse = await pc.inference.embed({
        model: EMBEDDING_MODEL,
        inputs: [query],
        parameters: { inputType: "query" },
      });
      const embedding = embedResponse.data[0];
      if (embedding.vectorType !== "dense") {
        throw new Error("Expected dense embedding");
      }
      const queryVector = embedding.values;

      const index = pc.index(PINECONE_INDEX_NAME);
      const filter = pais ? { pais: { $eq: pais } } : undefined;

      const results = await index.query({
        vector: queryVector,
        topK: TOP_K,
        includeMetadata: true,
        filter,
      });

      const cases: JurisprudenciaCase[] = (results.matches ?? []).map((match) => {
        const meta = match.metadata as Record<string, unknown>;
        return {
          expediente_id: String(meta.expediente_id ?? ""),
          hechos: String(meta.hechos ?? ""),
          ratio_decidendi: String(meta.ratio_decidendi ?? ""),
          probabilidad_exito: Number(meta.probabilidad_exito ?? 0),
          duracion_dias: Number(meta.duracion_dias ?? 0),
          pais: (meta.pais === "MX" ? "MX" : "AR") as "AR" | "MX",
        };
      });

      return {
        cases,
        source: "pinecone" as const,
        scores: (results.matches ?? []).map((m) => m.score),
      };
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (err) {
    logError("Pinecone search error", err, { route: "/api/search-jurisprudencia" });
    return NextResponse.json({ cases: [], source: "error" });
  }
}
