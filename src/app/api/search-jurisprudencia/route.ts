import { NextRequest, NextResponse } from "next/server";
import { getPinecone, PINECONE_INDEX_NAME } from "@/lib/pinecone";
import type { JurisprudenciaCase } from "@/lib/types";

const EMBEDDING_MODEL = "multilingual-e5-large";
const TOP_K = 5;

export async function POST(request: NextRequest) {
  const { query, pais } = await request.json();

  if (!query || typeof query !== "string") {
    return NextResponse.json(
      { error: "Query es requerido." },
      { status: 400 }
    );
  }

  if (!process.env.PINECONE_API_KEY) {
    // Fallback: return empty so the app uses the static jurisprudencia list
    return NextResponse.json({ cases: [], source: "static" });
  }

  try {
    const pc = getPinecone();

    // Generate query embedding
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

    // Search with optional country filter
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

    return NextResponse.json({
      cases,
      source: "pinecone",
      scores: (results.matches ?? []).map((m) => m.score),
    });
  } catch (err) {
    console.error("Pinecone search error:", err);
    // Return empty so the app falls back to static data
    return NextResponse.json({ cases: [], source: "error" });
  }
}
