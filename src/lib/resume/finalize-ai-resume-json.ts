import { ensureAllResumeIds } from "@/lib/resume/ensure-resume-ids";
import { clampResumeContentDeep } from "@/lib/resume/content-boundaries";
import { normalizeResumeContent, type ResumeContent } from "@/lib/resume/types";

/** Pipeline for structured JSON produced by AI: normalize → bounded strings → IDs. */
export function finalizeStructuredAiResume(parsed: unknown): ResumeContent {
  const normalized = normalizeResumeContent(parsed);
  return ensureAllResumeIds(clampResumeContentDeep(normalized));
}
