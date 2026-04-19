import { stripCodeFences } from "@/lib/ai/json-parse";

/** Parses model output as JSON for uploaded-resume improvement (single object). */
export function parseUploadResumeJson(text: string): unknown {
  const raw = stripCodeFences(text);
  return JSON.parse(raw) as unknown;
}
