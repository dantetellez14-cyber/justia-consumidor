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
import { supabase } from "@/lib/supabase";

const EMBEDDING_MODEL = "multilingual-e5-large";
const TOP_K = 12;          // Fetch more candidates for re-ranking
const SUPABASE_TOP_K = 8;
const SCORE_THRESHOLD = 0.45; // Min cosine similarity — drop irrelevant matches

// ── Supabase full-text helper ─────────────────────────────────────────────────

/**
 * Extract up to 3 meaningful keywords from the query for ILIKE matching.
 * Skips common Spanish stopwords and prefers longer, domain-relevant tokens.
 */
const STOPWORDS = new Set([
  "para","como","cuando","donde","porque","pero","desde","hasta","sobre",
  "entre","contra","ante","bajo","este","esta","estos","estas","tiene",
  "tuve","habia","quiero","necesito","problema","problemas","queja","caso",
  "tipo","manera","forma","todo","toda","todos","todas","algo","nada","bien",
  "malo","mala","buenos","buenas","dias","meses","años","hace","hice","hizo",
]);

function extractKeywords(query: string): string[] {
  const words = query
    .toLowerCase()
    .replace(/[^\w\sáéíóúüñ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
  // Sort by length descending — longer words are more specific
  const ranked = words.sort((a, b) => b.length - a.length);
  // Return up to 3 unique keywords
  return [...new Set(ranked)].slice(0, 3);
}

async function searchSupabase(
  query: string,
  pais?: string
): Promise<JurisprudenciaCase[]> {
  const keywords = extractKeywords(query);
  if (keywords.length === 0) return [];

  // Build OR filter across all keywords × both text fields
  const orClauses = keywords
    .map((kw) => `hechos.ilike.%${kw}%,ratio_decidendi.ilike.%${kw}%`)
    .join(",");

  let q = supabase
    .from("jurisprudencia_cases")
    .select(
      "expediente_id, hechos, ratio_decidendi, probabilidad_exito, duracion_dias, pais"
    )
    .or(orClauses)
    .gt("probabilidad_exito", 0)
    .order("probabilidad_exito", { ascending: false })
    .limit(SUPABASE_TOP_K);

  if (pais) {
    q = q.eq("pais", pais);
  }

  const { data, error } = await q;

  if (error) {
    logError("Supabase jurisprudencia search error", error, {
      route: "/api/search-jurisprudencia",
    });
    return [];
  }

  return (data ?? []).map((row) => ({
    expediente_id: String(row.expediente_id),
    hechos: String(row.hechos ?? ""),
    ratio_decidendi: String(row.ratio_decidendi ?? ""),
    probabilidad_exito: Number(row.probabilidad_exito ?? 0),
    duracion_dias: Number(row.duracion_dias ?? 0),
    pais: (row.pais === "MX" ? "MX" : "AR") as "AR" | "MX",
  }));
}

/**
 * Merge Pinecone + Supabase results with hybrid scoring.
 * Score = 0.7 * semanticScore + 0.3 * probabilidad_exito
 * Pinecone results are deduplicated first (they carry the semantic score).
 * Supabase-only results get semanticScore = 0.
 */
function mergeResults(
  pinecone: JurisprudenciaCase[],
  pineconeScores: number[],
  supabaseRows: JurisprudenciaCase[]
): JurisprudenciaCase[] {
  // Filter out low-similarity Pinecone results
  const pineconeFiltered = pinecone.filter(
    (_, i) => (pineconeScores[i] ?? 0) >= SCORE_THRESHOLD
  );
  const filteredScores = pineconeScores.filter((s) => s >= SCORE_THRESHOLD);

  // Build score map for Pinecone candidates
  const scoreMap = new Map<string, number>();
  pineconeFiltered.forEach((c, i) => scoreMap.set(c.expediente_id, filteredScores[i]));

  const seen = new Set<string>(pineconeFiltered.map((c) => c.expediente_id));
  const combined = [
    ...pineconeFiltered,
    ...supabaseRows.filter((c) => !seen.has(c.expediente_id)),
  ];

  // Hybrid score: semantic similarity weighted higher than domain prior
  return combined.sort((a, b) => {
    const semA = scoreMap.get(a.expediente_id) ?? 0;
    const semB = scoreMap.get(b.expediente_id) ?? 0;
    const scoreA = 0.7 * semA + 0.3 * a.probabilidad_exito;
    const scoreB = 0.7 * semB + 0.3 * b.probabilidad_exito;
    return scoreB - scoreA;
  });
}

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

  // Cache key: normalize query to first 100 chars + country — 24h TTL
  const normalizedQuery = query.toLowerCase().trim().slice(0, 100);
  const cacheKey = `juris:${normalizedQuery}:${pais ?? "all"}`;

  if (!process.env.PINECONE_API_KEY) {
    // No Pinecone — query Supabase only
    try {
      const supabaseCases = await cached(cacheKey, 86400, () =>
        searchSupabase(query, pais)
      );
      return NextResponse.json(
        { cases: supabaseCases, source: "supabase" },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=86400, stale-while-revalidate=43200",
          },
        }
      );
    } catch (err) {
      logError("Supabase-only search error", err, {
        route: "/api/search-jurisprudencia",
      });
      return NextResponse.json({ cases: [], source: "error" });
    }
  }

  try {
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

      const [pineconeResults, supabaseCases] = await Promise.all([
        index.query({
          vector: queryVector,
          topK: TOP_K,
          includeMetadata: true,
          filter,
        }),
        searchSupabase(query, pais),
      ]);

      const matches = pineconeResults.matches ?? [];
      const rawScores = matches.map((m) => m.score ?? 0);

      const pineconeCases: JurisprudenciaCase[] = matches.map((match) => {
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

      const merged = mergeResults(pineconeCases, rawScores, supabaseCases);

      return {
        cases: merged,
        source: "pinecone+supabase" as const,
        scores: rawScores,
      };
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (err) {
    logError("Search error", err, { route: "/api/search-jurisprudencia" });
    return NextResponse.json({ cases: [], source: "error" });
  }
}
