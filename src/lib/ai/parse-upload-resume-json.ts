import { stripCodeFences } from "@/lib/ai/json-parse";

/** Parses model output as JSON for structured resume payloads (upload, scratch, fill-partial). */
export function parseUploadResumeJson(text: string): unknown {
  const raw = stripCodeFences(text.trim());
  if (!raw) {
    throw new Error("Empty AI response");
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new Error("Could not parse AI response as resume JSON");
  }
}
