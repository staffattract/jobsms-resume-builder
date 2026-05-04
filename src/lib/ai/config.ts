/**
 * Central AI defaults. Prefer env overrides at runtime (e.g. OPENAI_MODEL).
 */

import { requireEnv } from "@/lib/env/server";

/** Used when `OPENAI_MODEL` is not set. Do not duplicate this string elsewhere. */
export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

export function getOpenAiApiKey(): string {
  return requireEnv("OPENAI_API_KEY");
}

/** Resolved model name for OpenAI chat completions. */
export function resolveOpenAIModel(): string {
  const fromEnv = process.env.OPENAI_MODEL?.trim();
  return fromEnv || DEFAULT_OPENAI_MODEL;
}
