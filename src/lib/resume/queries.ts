import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { normalizeResumeContent } from "@/lib/resume/types";

export async function listResumesForCurrentUser() {
  const user = await requireUser();
  return prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      updatedAt: true,
    },
  });
}

export async function getResumeForCurrentUser(resumeId: string) {
  const user = await requireUser();
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId: user.id },
  });
  if (!resume) {
    return null;
  }
  return {
    id: resume.id,
    title: resume.title,
    status: resume.status,
    schemaVersion: resume.schemaVersion,
    content: normalizeResumeContent(resume.content),
    updatedAt: resume.updatedAt,
  };
}
