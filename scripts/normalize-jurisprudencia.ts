/**
 * normalize-jurisprudencia.ts
 * Reads data/jurisprudencia.json, finds cases with normalizado_por_ia: false,
 * calls Gemini to fill hechos/ratio_decidendi/categoria/probabilidad_exito/duracion_dias,
 * writes back the updated JSON.
 *
 * Usage:
 *   npx tsx scripts/normalize-jurisprudencia.ts
 *
 * Requires: GEMINI_API_KEY
 */

import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  readJurisprudenciaJSON,
  writeJurisprudenciaJSON,
} from "./lib/jurisprudencia-io";
import {
  buildNormalizePrompt,
  parseNormalizeResponse,
} from "./lib/normalize-prompt";

const BATCH_SIZE = 1;
// gemini-2.5-flash: 20 req/day free tier — fall back to 2.0-flash (1500 req/day) then 2.0-flash-lite
const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
const DELAY_MS = 4000; // 4s between requests (~15 rpm, well under 15 rpm limit)

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[normalize] Error: GEMINI_API_KEY is required");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Start with 2.5-flash, fall back to 1.5-flash on 429
  let modelIndex = 0;
  let model = genAI.getGenerativeModel({ model: MODELS[modelIndex] });
  console.log(`[normalize] Using model: ${MODELS[modelIndex]}`);

  const cases = readJurisprudenciaJSON();
  const toNormalize = cases.filter((c) => !c.normalizado_por_ia && c.texto_crudo);

  console.log(
    `[normalize] Found ${toNormalize.length} cases to normalize out of ${cases.length} total`
  );

  if (toNormalize.length === 0) {
    console.log("[normalize] Nothing to do.");
    return;
  }

  let normalizedCount = 0;
  let failedCount = 0;

  // Process in batches
  for (let i = 0; i < toNormalize.length; i += BATCH_SIZE) {
    const batch = toNormalize.slice(i, i + BATCH_SIZE);
    console.log(
      `[normalize] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(toNormalize.length / BATCH_SIZE)} (${batch.length} cases)`
    );

    await Promise.all(
      batch.map(async (caseItem) => {
        try {
          const prompt = buildNormalizePrompt(caseItem.texto_crudo);
          const result = await model.generateContent(prompt);
          const responseText = result.response.text();
          const parsed = parseNormalizeResponse(responseText);

          if (!parsed) {
            console.warn(
              `[normalize] Could not parse Gemini response for ${caseItem.expediente_id}`
            );
            failedCount++;
            return;
          }

          // Update case in-place
          caseItem.hechos = parsed.hechos;
          caseItem.ratio_decidendi = parsed.ratio_decidendi;
          caseItem.categoria = parsed.categoria;
          caseItem.probabilidad_exito = parsed.probabilidad_exito;
          caseItem.duracion_dias = parsed.duracion_dias;
          caseItem.normalizado_por_ia = true;
          normalizedCount++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const isQuota = msg.includes("429") || msg.includes("quota");

          // Try next model in the fallback chain on quota exhaustion
          if (isQuota && modelIndex < MODELS.length - 1) {
            modelIndex++;
            model = genAI.getGenerativeModel({ model: MODELS[modelIndex] });
            console.warn(
              `[normalize] Quota hit on ${MODELS[modelIndex - 1]}, switching to ${MODELS[modelIndex]}`
            );
            // Retry this case with the new model
            try {
              const prompt = buildNormalizePrompt(caseItem.texto_crudo);
              const result = await model.generateContent(prompt);
              const responseText = result.response.text();
              const parsed = parseNormalizeResponse(responseText);
              if (parsed) {
                caseItem.hechos = parsed.hechos;
                caseItem.ratio_decidendi = parsed.ratio_decidendi;
                caseItem.categoria = parsed.categoria;
                caseItem.probabilidad_exito = parsed.probabilidad_exito;
                caseItem.duracion_dias = parsed.duracion_dias;
                caseItem.normalizado_por_ia = true;
                normalizedCount++;
                return;
              }
            } catch (retryErr) {
              console.warn(
                `[normalize] Retry failed for ${caseItem.expediente_id}:`,
                retryErr instanceof Error ? retryErr.message.slice(0, 120) : retryErr
              );
            }
          } else {
            console.warn(
              `[normalize] Gemini error for ${caseItem.expediente_id}:`,
              msg.slice(0, 120)
            );
          }
          failedCount++;
        }
      })
    );

    // Write progress after each batch so partial progress is saved
    writeJurisprudenciaJSON(cases);

    if (i + BATCH_SIZE < toNormalize.length) {
      await sleep(DELAY_MS);
    }
  }

  console.log(
    `[normalize] Done. Normalized: ${normalizedCount}, Failed: ${failedCount}`
  );
}

main().catch((err) => {
  console.error("[normalize] Fatal error:", err);
  process.exit(1);
});
