"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { recommendTemplateFromContent } from "@/lib/resume/templates/recommend";
import {
  coerceResumeTemplateId,
  isValidResumeTemplateId,
} from "@/lib/resume/templates/registry";
import {
  defaultResumeContent,
  normalizeResumeContent,
  type ResumeContent,
} from "@/lib/resume/types";

export async function createResume() {
  const user = await requireUser();
  const content = defaultResumeContent();
  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      content: content as unknown as Prisma.InputJsonValue,
      schemaVersion: 1,
    },
  });
  redirect(`/resumes/${resume.id}`);
}

export async function selectResumeTemplate(formData: FormData) {
  const resumeId = String(formData.get("resumeId") ?? "").trim();
  const templateIdRaw = String(formData.get("templateId") ?? "").trim();
  const changeOnly = String(formData.get("changeOnly") ?? "") === "1";
  if (!resumeId) {
    redirect("/resumes");
  }
  const user = await requireUser();
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId: user.id },
  });
  if (!resume) {
    redirect("/resumes");
  }
  const content = normalizeResumeContent(resume.content);
  const templateId = isValidResumeTemplateId(templateIdRaw)
    ? templateIdRaw
    : coerceResumeTemplateId(content.meta.templateId);
  const next: ResumeContent = {
    ...content,
    meta: {
      ...content.meta,
      templateId,
      templateSelectionComplete: changeOnly
        ? content.meta.templateSelectionComplete
        : true,
    },
  };
  await prisma.resume.update({
    where: { id: resumeId, userId: user.id },
    data: {
      content: next as unknown as Prisma.InputJsonValue,
      schemaVersion: 1,
    },
  });
  redirect(`/resumes/${resumeId}`);
}

export async function applyAiRecommendedResumeTemplate(formData: FormData) {
  const resumeId = String(formData.get("resumeId") ?? "").trim();
  if (!resumeId) {
    redirect("/resumes");
  }
  const user = await requireUser();
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId: user.id },
  });
  if (!resume) {
    redirect("/resumes");
  }
  const content = normalizeResumeContent(resume.content);
  const templateId = recommendTemplateFromContent(content);
  const next: ResumeContent = {
    ...content,
    meta: {
      ...content.meta,
      templateId: coerceResumeTemplateId(templateId),
      templateSelectionComplete: true,
    },
  };
  await prisma.resume.update({
    where: { id: resumeId, userId: user.id },
    data: {
      content: next as unknown as Prisma.InputJsonValue,
      schemaVersion: 1,
    },
  });
  redirect(`/resumes/${resumeId}`);
}

export async function updateResumeTitle(resumeId: string, title: string) {
  const user = await requireUser();
  const trimmed = title.trim() || "Untitled Resume";
  await prisma.resume.update({
    where: { id: resumeId, userId: user.id },
    data: { title: trimmed },
  });
}

export async function updateResumeContent(resumeId: string, content: ResumeContent) {
  const user = await requireUser();
  await prisma.resume.update({
    where: { id: resumeId, userId: user.id },
    data: {
      content: content as unknown as Prisma.InputJsonValue,
      schemaVersion: 1,
    },
  });
}
