/**
 * normalize-jurisprudencia.ts
 * Reads data/jurisprudencia.json, finds cases with normalizado_por_ia: false,
 * calls local Ollama (Gemma) to fill hechos/ratio_decidendi/categoria/probabilidad_exito/duracion_dias,
 * writes back the updated JSON.
 *
 * Usage:
 *   npx tsx scripts/normalize-jurisprudencia.ts
 */

import {
  readJurisprudenciaJSON,
  writeJurisprudenciaJSON,
} from "./lib/jurisprudencia-io";
import {
  buildNormalizePrompt,
  parseNormalizeResponse,
} from "./lib/normalize-prompt";

const BATCH_SIZE = 1; // Process 1 at a time for local models (Gemma) to avoid overloading
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = "gemma"; // or gemma:2b, depending on what you use locally

async function generateWithOllama(prompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.2, // Low temp for more accurate JSON parsing
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API returned status: ${response.status}`);
  }

  const data = await response.json();
  return data.response;
}

async function main(): Promise<void> {
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

  for (let i = 0; i < toNormalize.length; i += BATCH_SIZE) {
    const batch = toNormalize.slice(i, i + BATCH_SIZE);
    console.log(
      `[normalize] Processing case ${i + 1}/${toNormalize.length}...`
    );

    for (const caseItem of batch) {
      try {
        const prompt = buildNormalizePrompt(caseItem.texto_crudo);
        const responseText = await generateWithOllama(prompt);
        const parsed = parseNormalizeResponse(responseText);

        if (!parsed) {
          console.warn(
            `[normalize] Could not parse Ollama response for ${caseItem.expediente_id}. Raw output:`, responseText
          );
          failedCount++;
          continue;
        }

        caseItem.hechos = parsed.hechos;
        caseItem.ratio_decidendi = parsed.ratio_decidendi;
        caseItem.categoria = parsed.categoria;
        caseItem.probabilidad_exito = parsed.probabilidad_exito;
        caseItem.duracion_dias = parsed.duracion_dias;
        caseItem.normalizado_por_ia = true;
        normalizedCount++;
      } catch (err) {
        console.warn(
          `[normalize] Ollama error for ${caseItem.expediente_id}:`,
          err instanceof Error ? err.message : err
        );
        failedCount++;
      }
    }

    // Write progress immediately
    writeJurisprudenciaJSON(cases);
  }

  console.log(
    `[normalize] Done. Normalized: ${normalizedCount}, Failed: ${failedCount}`
  );
}

main().catch((err) => {
  console.error("[normalize] Fatal error:", err);
  process.exit(1);
});
