import type { AIProvider, ChatMessage } from "@/lib/ai/types";
import { createOpenAIProviderFromEnv } from "@/lib/ai/openai-provider";
import {
  ASSISTANT_STYLE,
  generateSummaryUserPrompt,
  improveBulletUserPrompt,
  scratchBuildUserPrompt,
  tailorToJobUserPrompt,
  uploadResumeImproveUserPrompt,
} from "@/lib/ai/prompts";
import {
  MAX_BULLET_CHARS,
  MAX_JOB_DESCRIPTION_CHARS,
  MAX_RESUME_JSON_CHARS,
  MAX_SCRATCH_CONTEXT_CHARS,
  MAX_SCRATCH_TITLE,
  MAX_UPLOAD_RESUME_TEXT,
  truncate,
} from "@/lib/ai/limits";
import { parseTailorJson } from "@/lib/ai/json-parse";
import { parseUploadResumeJson } from "@/lib/ai/parse-upload-resume-json";
import { ensureAllResumeIds } from "@/lib/resume/ensure-resume-ids";
import { coerceResumeTemplateId } from "@/lib/resume/templates/registry";
import {
  normalizeResumeContent,
  type ResumeContent,
} from "@/lib/resume/types";

let cachedProvider: AIProvider | null = null;

/** Default provider (OpenAI). Swap factory later for other vendors. */
export function getAIProvider(): AIProvider {
  if (!cachedProvider) {
    cachedProvider = createOpenAIProviderFromEnv();
  }
  return cachedProvider;
}

export function resetAIProviderForTests(): void {
  cachedProvider = null;
}

async function run(
  provider: AIProvider,
  userContent: string,
  temperature?: number,
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: ASSISTANT_STYLE },
    { role: "user", content: userContent },
  ];
  return provider.complete(messages, { temperature });
}

export async function improveBullet(
  provider: AIProvider,
  bulletText: string,
): Promise<string> {
  const trimmed = truncate(bulletText.trim(), MAX_BULLET_CHARS);
  if (!trimmed.trim()) {
    throw new Error("Bullet text is empty");
  }
  const text = await run(
    provider,
    improveBulletUserPrompt(trimmed),
    0.35,
  );
  const out = text.trim();
  if (!out) {
    throw new Error("Model returned an empty bullet");
  }
  return out;
}

export async function generateSummary(
  provider: AIProvider,
  resumeContent: ResumeContent,
): Promise<string> {
  const json = JSON.stringify(resumeContent);
  const clipped = truncate(json, MAX_RESUME_JSON_CHARS);
  const text = await run(
    provider,
    generateSummaryUserPrompt(clipped),
    0.4,
  );
  const out = text.trim();
  if (!out) {
    throw new Error("Model returned an empty summary");
  }
  return out;
}

export async function tailorToJob(
  provider: AIProvider,
  jobDescription: string,
  resumeContent: ResumeContent,
): Promise<{ summary: string; alignmentNotes?: string }> {
  const jd = truncate(jobDescription.trim(), MAX_JOB_DESCRIPTION_CHARS);
  if (!jd.trim()) {
    throw new Error("Job description is empty");
  }
  const json = JSON.stringify(resumeContent);
  const clipped = truncate(json, MAX_RESUME_JSON_CHARS);
  const raw = await run(
    provider,
    tailorToJobUserPrompt(jd, clipped),
    0.35,
  );
  const { summary, alignmentNotes } = parseTailorJson(raw);
  return {
    summary,
    ...(alignmentNotes !== undefined ? { alignmentNotes } : {}),
  };
}

export async function improveUploadedResumeToContent(
  provider: AIProvider,
  rawText: string,
): Promise<ResumeContent> {
  const clipped = truncate(rawText.trim(), MAX_UPLOAD_RESUME_TEXT);
  if (!clipped.trim()) {
    throw new Error("No text extracted from file");
  }
  const raw = await run(
    provider,
    uploadResumeImproveUserPrompt(clipped),
    0.35,
  );
  let parsed: unknown;
  try {
    parsed = parseUploadResumeJson(raw);
  } catch {
    throw new Error("Could not parse AI response as resume JSON");
  }
  const normalized = normalizeResumeContent(parsed);
  return ensureAllResumeIds(normalized);
}

export async function generateScratchResumeContent(
  provider: AIProvider,
  jobTitle: string,
  experienceContext: string,
): Promise<ResumeContent> {
  const title = truncate(jobTitle.trim(), MAX_SCRATCH_TITLE);
  if (!title.trim()) {
    throw new Error("Job title is required");
  }
  const ctx = truncate(experienceContext.trim(), MAX_SCRATCH_CONTEXT_CHARS);
  const raw = await run(
    provider,
    scratchBuildUserPrompt(title, ctx),
    0.35,
  );
  let parsed: unknown;
  try {
    parsed = parseUploadResumeJson(raw);
  } catch {
    throw new Error("Could not parse AI response as resume JSON");
  }
  const normalized = normalizeResumeContent(parsed);
  const withIds = ensureAllResumeIds(normalized);
  const out: ResumeContent = {
    ...withIds,
    target: { ...withIds.target, jobTitle: withIds.target.jobTitle ?? title },
    meta: {
      ...withIds.meta,
      templateId: coerceResumeTemplateId(withIds.meta.templateId),
      templateSelectionComplete: true,
    },
  };
  return out;
}
