"use server";

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { normalizeResumeContent, type ResumeContent } from "@/lib/resume/types";
import { getAIProvider, generateSummary, improveBullet, tailorToJob } from "@/lib/ai/service";

async function assertResumeOwned(resumeId: string, userId: string) {
  const row = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
    select: { id: true },
  });
  if (!row) {
    throw new Error("Resume not found");
  }
}

function logAiError(params: { action: string; resumeId: string; error: unknown }) {
  const message =
    params.error instanceof Error
      ? params.error.message
      : String(params.error);
  const resumeRef =
    params.resumeId.length > 12
      ? `${params.resumeId.slice(0, 8)}…`
      : params.resumeId;
  console.error(`[ai] ${params.action} failed`, resumeRef, message);
}

export type AiActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function improveBulletAction(
  resumeId: string,
  bulletText: string,
): Promise<AiActionResult<{ suggestion: string }>> {
  try {
    const user = await requireUser();
    await assertResumeOwned(resumeId, user.id);
    const suggestion = await improveBullet(getAIProvider(), bulletText);
    return { ok: true, data: { suggestion } };
  } catch (e) {
    logAiError({
      action: "improveBulletAction",
      resumeId,
      error: e,
    });
    const message = e instanceof Error ? e.message : "Request failed";
    return { ok: false, error: message };
  }
}

export async function generateSummaryAction(
  resumeId: string,
  content: ResumeContent,
): Promise<AiActionResult<{ suggestion: string }>> {
  try {
    const user = await requireUser();
    await assertResumeOwned(resumeId, user.id);
    const normalized = normalizeResumeContent(content);
    const suggestion = await generateSummary(getAIProvider(), normalized);
    return { ok: true, data: { suggestion } };
  } catch (e) {
    logAiError({
      action: "generateSummaryAction",
      resumeId,
      error: e,
    });
    const message = e instanceof Error ? e.message : "Request failed";
    return { ok: false, error: message };
  }
}

export type TailorResult = {
  summary: string;
  alignmentNotes?: string;
};

export async function tailorToJobAction(
  resumeId: string,
  jobDescription: string,
  content: ResumeContent,
): Promise<AiActionResult<TailorResult>> {
  try {
    const user = await requireUser();
    await assertResumeOwned(resumeId, user.id);
    const normalized = normalizeResumeContent(content);
    const { summary, alignmentNotes } = await tailorToJob(
      getAIProvider(),
      jobDescription,
      normalized,
    );
    const data: TailorResult = {
      summary,
      ...(alignmentNotes !== undefined ? { alignmentNotes } : {}),
    };
    return { ok: true, data };
  } catch (e) {
    logAiError({
      action: "tailorToJobAction",
      resumeId,
      error: e,
    });
    const message = e instanceof Error ? e.message : "Request failed";
    return { ok: false, error: message };
  }
}
