/**
 * track-tokens.ts
 * Non-blocking helper to log AI token usage to `token_usage` table.
 * Never throws — analytics failures must not break the main request.
 */

import { supabase } from "@/lib/supabase";
import { logError } from "@/lib/logger";

export interface TokenTrackingParams {
  userId: string | null;
  route: string;
  model: string;
  provider: "gemini" | "anthropic" | "ollama" | "pinecone" | "demo";
  inputTokens: number;
  outputTokens: number;
  latencyMs?: number;
  success?: boolean;
  caseId?: string;
  sessionId?: string;
}

/**
 * Estimate token count from text (~4 chars per token for Spanish).
 * Used for Ollama/demo where the API doesn't return actual token counts.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Fire-and-forget token usage tracking.
 * Call with `void trackTokenUsage(...)` — never await.
 */
export async function trackTokenUsage(params: TokenTrackingParams): Promise<void> {
  try {
    const { error } = await supabase.from("token_usage").insert({
      user_id: params.userId,
      route: params.route,
      model: params.model,
      provider: params.provider,
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      latency_ms: params.latencyMs ?? null,
      success: params.success ?? true,
      case_id: params.caseId ?? null,
      session_id: params.sessionId ?? null,
    });

    if (error) {
      logError("trackTokenUsage insert error", error, { route: params.route });
    }
  } catch (err) {
    logError("trackTokenUsage unexpected error", err, { route: params.route });
  }
}
