"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { defaultResumeContent, type ResumeContent } from "@/lib/resume/types";

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
