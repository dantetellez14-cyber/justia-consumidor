/**
 * seed-pinecone.ts
 * Upserts jurisprudencia cases from Supabase into Pinecone.
 *
 * Usage:
 *   npx tsx scripts/seed-pinecone.ts              # full re-seed (all valid cases)
 *   npx tsx scripts/seed-pinecone.ts --incremental # only new cases not yet indexed
 *
 * Requires: PINECONE_API_KEY + Supabase env vars
 */

import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { Pinecone } from "@pinecone-database/pinecone";
import { readJurisprudenciaDB } from "./lib/jurisprudencia-io";
import { buildVectorId, getNewCasesForPinecone } from "./lib/pinecone-helpers";
import type { JurisprudenciaCaseExtended } from "../src/lib/types";

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "justia-jurisprudencia";
const EMBEDDING_MODEL = "multilingual-e5-large";
const EMBEDDING_DIM = 1024;
const INCREMENTAL = process.argv.includes("--incremental");

async function ensureIndex(pc: Pinecone): Promise<void> {
  const existing = await pc.listIndexes();
  const names = existing.indexes?.map((i) => i.name) ?? [];
  if (!names.includes(PINECONE_INDEX_NAME)) {
    console.log(`Creating index "${PINECONE_INDEX_NAME}"...`);
    await pc.createIndex({
      name: PINECONE_INDEX_NAME,
      dimension: EMBEDDING_DIM,
      metric: "cosine",
      spec: { serverless: { cloud: "aws", region: "us-east-1" } },
    });
    console.log("Waiting 15s for index to be ready...");
    await new Promise((r) => setTimeout(r, 15_000));
  }
}

async function getExistingIds(pc: Pinecone): Promise<Set<string>> {
  try {
    const index = pc.index(PINECONE_INDEX_NAME);
    const ids = new Set<string>();
    let paginationToken: string | undefined;
    do {
      // listPaginated is not yet in Pinecone's public TS types but exists at runtime
      const result = await (index as unknown as { listPaginated: (opts: { paginationToken?: string; limit: number }) => Promise<{ vectors?: { id: string }[]; pagination?: { next?: string } }> }).listPaginated({
        paginationToken,
        limit: 100,
      });
      for (const v of result.vectors ?? []) {
        if (v.id) ids.add(v.id);
      }
      paginationToken = result.pagination?.next;
    } while (paginationToken);
    console.log(`[seed] Found ${ids.size} existing vectors in Pinecone`);
    return ids;
  } catch (err) {
    console.warn(
      "[seed] Could not list existing IDs, will upsert all:",
      err instanceof Error ? err.message : err
    );
    return new Set();
  }
}

async function upsertCases(
  pc: Pinecone,
  cases: JurisprudenciaCaseExtended[]
): Promise<void> {
  if (cases.length === 0) return;

  const index = pc.index(PINECONE_INDEX_NAME);

  // multilingual-e5-large accepts max 96 inputs per embed call
  const EMBED_BATCH = 96;
  const UPSERT_BATCH = 100;
  const totalBatches = Math.ceil(cases.length / EMBED_BATCH);

  console.log(`[seed] Embedding + upserting ${cases.length} cases in batches of ${EMBED_BATCH}...`);

  for (let i = 0; i < cases.length; i += EMBED_BATCH) {
    const chunk = cases.slice(i, i + EMBED_BATCH);
    const texts = chunk.map((c) => `${c.hechos} ${c.ratio_decidendi}`);
    const batchNum = Math.floor(i / EMBED_BATCH) + 1;

    const embedResponse = await pc.inference.embed({
      model: EMBEDDING_MODEL,
      inputs: texts,
      parameters: { inputType: "passage" },
    });

    const vectors = chunk.map((c, j) => {
      const embedding = embedResponse.data[j];
      if (embedding.vectorType !== "dense") {
        throw new Error(`Unexpected vector type: ${embedding.vectorType}`);
      }
      return {
        id: buildVectorId(c.expediente_id),
        values: embedding.values,
        metadata: {
          expediente_id: c.expediente_id,
          hechos: c.hechos,
          ratio_decidendi: c.ratio_decidendi,
          probabilidad_exito: c.probabilidad_exito,
          duracion_dias: c.duracion_dias,
          pais: c.pais,
          categoria: c.categoria,
          tribunal: c.tribunal,
          fecha_resolucion: c.fecha_resolucion,
          url_fuente: c.url_fuente,
        },
      };
    });

    // Upsert this chunk's vectors
    for (let j = 0; j < vectors.length; j += UPSERT_BATCH) {
      await index.upsert({ records: vectors.slice(j, j + UPSERT_BATCH) });
    }

    process.stdout.write(`[seed] Batch ${batchNum}/${totalBatches} done (${Math.min(i + EMBED_BATCH, cases.length)}/${cases.length})\r`);
  }
  console.log(`\n[seed] All ${cases.length} vectors upserted.`);
}

async function main(): Promise<void> {
  if (!process.env.PINECONE_API_KEY) {
    console.error("[seed] Error: PINECONE_API_KEY is required");
    process.exit(1);
  }

  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  await ensureIndex(pc);

  const allCases = await readJurisprudenciaDB();
  console.log(`[seed] Loaded ${allCases.length} cases from Supabase`);

  if (INCREMENTAL) {
    const existingIds = await getExistingIds(pc);
    const newCases = getNewCasesForPinecone(allCases, existingIds);

    if (newCases.length === 0) {
      console.log("[seed] No new cases to upsert (incremental mode).");
      return;
    }

    console.log(
      `[seed] Incremental: ${newCases.length} new, ${allCases.length - newCases.length} skipped`
    );
    await upsertCases(pc, newCases);
  } else {
    // Full re-seed: only upsert cases with valid probabilidad_exito
    const validCases = allCases.filter((c) => c.probabilidad_exito > 0);
    await upsertCases(pc, validCases);
  }

  console.log("[seed] Done!");
}

main().catch((err) => {
  console.error("[seed] Fatal:", err);
  process.exit(1);
});
