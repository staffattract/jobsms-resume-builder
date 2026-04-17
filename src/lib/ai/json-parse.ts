import type { TailorSuggestion } from "@/lib/ai/types";

/** Strip optional ```json ... ``` wrapper from model output. */
export function stripCodeFences(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "");
    t = t.replace(/\s*```\s*$/i, "");
  }
  return t.trim();
}

export function parseTailorJson(text: string): TailorSuggestion {
  const raw = stripCodeFences(text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("Could not parse AI response as JSON");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid tailor response shape");
  }
  const o = parsed as Record<string, unknown>;
  // V1: only `summary` and `alignmentNotes` are read; all other keys are ignored.
  const summary = typeof o.summary === "string" ? o.summary.trim() : "";
  const rawNotes = o.alignmentNotes;
  const alignmentNotes =
    typeof rawNotes === "string" && rawNotes.trim() !== ""
      ? rawNotes.trim()
      : undefined;
  if (!summary) {
    throw new Error("Tailor response missing summary");
  }
  return { summary, alignmentNotes };
}
