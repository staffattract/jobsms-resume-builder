import { NextResponse } from "next/server";
import { requireVerifiedSessionUser } from "@/lib/auth/api-auth";
import { getAIProvider, improveUploadedResumeToContent } from "@/lib/ai/service";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  extractTextFromUpload,
  type UploadFileKind,
} from "@/lib/resume/parse-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;

function kindFromUpload(file: File): UploadFileKind | null {
  const n = file.name.toLowerCase();
  if (file.type === "application/pdf" || n.endsWith(".pdf")) {
    return "pdf";
  }
  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    n.endsWith(".docx")
  ) {
    return "docx";
  }
  return null;
}

function titleFromContent(fullName?: string) {
  const base = fullName?.trim();
  if (base) {
    return `${base.slice(0, 80)} — imported`;
  }
  return "Imported resume";
}

export async function POST(request: Request) {
  const user = await requireVerifiedSessionUser();
  if (user instanceof NextResponse) {
    return user;
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const entry = formData.get("file");
  if (!entry || typeof entry === "string") {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (!("arrayBuffer" in entry)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  const file = entry as File;
  const kind = kindFromUpload(file);
  if (!kind) {
    return NextResponse.json(
      { error: "Only PDF or DOCX files are supported." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0 || buffer.length > MAX_BYTES) {
    return NextResponse.json(
      { error: "File must be under 5 MB and non-empty." },
      { status: 400 },
    );
  }

  let text: string;
  try {
    text = await extractTextFromUpload(buffer, kind);
  } catch (err) {
    console.error("[resume-upload] extract", err);
    return NextResponse.json(
      { error: "Could not read that file. Try another export." },
      { status: 422 },
    );
  }

  if (!text.trim()) {
    return NextResponse.json(
      { error: "No text could be extracted from this file." },
      { status: 422 },
    );
  }

  if (text.trim().length < 200) {
    return NextResponse.json(
      {
        error:
          "Could not read your resume. Please upload a text-based PDF or DOCX.",
      },
      { status: 422 },
    );
  }

  let content: Awaited<ReturnType<typeof improveUploadedResumeToContent>>;
  try {
    const provider = getAIProvider();
    content = await improveUploadedResumeToContent(provider, text);
  } catch (err) {
    console.error(
      "[resume-upload] ai",
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.json(
      { error: "Could not improve this resume with AI. Try a simpler file." },
      { status: 502 },
    );
  }

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title: titleFromContent(content.contact.fullName),
      content: content as unknown as Prisma.InputJsonValue,
      schemaVersion: 1,
    },
  });

  return NextResponse.json({ resumeId: resume.id });
}
