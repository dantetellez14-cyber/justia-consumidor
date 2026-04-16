/**
 * normalize-jurisprudencia.ts
 * Reads unnormalized cases from Supabase, extracts structured fields using
 * an LLM, and writes back the updated rows.
 *
 * Provider chain (free tier, no cost):
 *   1. Gemini 2.5-flash  (20 req/day)  — fast, accurate
 *   2. Ollama gemma3:27b (∞, local)    — unlimited fallback
 *      (disabled in CI via CI=true env var — Ollama is not available on GH Actions)
 *
 * Usage:
 *   npx tsx scripts/normalize-jurisprudencia.ts
 */

import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  readUnnormalizedFromDB,
  upsertCaseToDB,
} from "./lib/jurisprudencia-io";
import {
  buildNormalizePrompt,
  parseNormalizeResponse,
} from "./lib/normalize-prompt";

// ── Configuration ────────────────────────────────────────────────────────────

const GEMINI_MODEL = "gemini-2.5-flash";
const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = "gemma3:27b";
const DELAY_MS = 2000; // 2s between requests
const IS_CI = process.env.CI === "true";

// ── Provider abstraction ─────────────────────────────────────────────────────

type Provider = "gemini" | "ollama";

interface ProviderState {
  current: Provider;
  geminiExhausted: boolean;
}

async function generateWithGemini(
  prompt: string,
  apiKey: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateWithOllama(prompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: { temperature: 0.1 },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama error ${response.status}: ${await response.text()}`
    );
  }

  const data = (await response.json()) as { response: string };
  return data.response;
}

async function generate(
  prompt: string,
  state: ProviderState,
  apiKey: string
): Promise<{ text: string; usedProvider: Provider }> {
  if (state.current === "gemini" && !state.geminiExhausted) {
    try {
      const text = await generateWithGemini(prompt, apiKey);
      return { text, usedProvider: "gemini" };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isQuota = msg.includes("429") || msg.includes("quota");

      if (isQuota) {
        if (IS_CI) {
          console.warn(
            "[normalize] Gemini quota exhausted in CI — Ollama is not available. Stopping."
          );
          // In CI, fail gracefully: remaining cases stay unnormalized for next run.
          throw new Error("GEMINI_QUOTA_EXHAUSTED_IN_CI");
        }
        console.warn(
          `[normalize] Gemini quota exhausted → switching to Ollama ${OLLAMA_MODEL}`
        );
        state.geminiExhausted = true;
        state.current = "ollama";
        // Fall through to Ollama below
      } else {
        throw err; // non-quota Gemini error — propagate
      }
    }
  }

  // Ollama path
  const text = await generateWithOllama(prompt);
  return { text, usedProvider: "ollama" };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY ?? "";

  if (!apiKey) {
    if (IS_CI) {
      console.error(
        "[normalize] GEMINI_API_KEY not set in CI — cannot normalize without Ollama fallback. Exiting."
      );
      process.exit(1);
    }
    console.warn("[normalize] GEMINI_API_KEY not set — using Ollama only");
  }

  const state: ProviderState = {
    current: apiKey ? "gemini" : "ollama",
    geminiExhausted: !apiKey,
  };

  console.log(`[normalize] Starting with provider: ${state.current}`);
  if (IS_CI) {
    console.log("[normalize] Running in CI mode — Ollama fallback disabled");
  } else if (state.current === "ollama") {
    console.log(`[normalize] Ollama model: ${OLLAMA_MODEL} at ${OLLAMA_URL}`);
  }

  const toNormalize = await readUnnormalizedFromDB();

  console.log(`[normalize] ${toNormalize.length} cases to normalize`);

  if (toNormalize.length === 0) {
    console.log("[normalize] Nothing to do.");
    return;
  }

  let normalizedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < toNormalize.length; i++) {
    const caseItem = toNormalize[i];
    const label = `[${i + 1}/${toNormalize.length}]`;

    try {
      const prompt = buildNormalizePrompt(caseItem.texto_crudo);
      const { text, usedProvider } = await generate(prompt, state, apiKey);
      const parsed = parseNormalizeResponse(text);

      if (!parsed) {
        console.warn(
          `[normalize] ${label} Could not parse response for ${caseItem.expediente_id} (${usedProvider})`
        );
        failedCount++;
      } else {
        const updated = {
          ...caseItem,
          hechos: parsed.hechos,
          ratio_decidendi: parsed.ratio_decidendi,
          categoria: parsed.categoria,
          probabilidad_exito: parsed.probabilidad_exito,
          duracion_dias: parsed.duracion_dias,
          normalizado_por_ia: true,
        };

        await upsertCaseToDB(updated);

        normalizedCount++;
        console.log(
          `[normalize] ${label} ✓ ${caseItem.expediente_id.slice(0, 50)} (prob: ${parsed.probabilidad_exito}, via ${usedProvider})`
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);

      if (msg === "GEMINI_QUOTA_EXHAUSTED_IN_CI") {
        console.log(
          `[normalize] Stopping early — ${normalizedCount} normalized before quota hit.`
        );
        break;
      }

      console.warn(
        `[normalize] ${label} ✗ ${caseItem.expediente_id.slice(0, 50)}: ${msg.slice(0, 100)}`
      );
      failedCount++;
    }

    if (i < toNormalize.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(
    `\n[normalize] Done. ✓ ${normalizedCount} normalized | ✗ ${failedCount} failed`
  );
  console.log(`[normalize] Final provider used: ${state.current}`);
}

main().catch((err) => {
  console.error("[normalize] Fatal error:", err);
  process.exit(1);
});
