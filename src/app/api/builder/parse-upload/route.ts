import { NextResponse } from "next/server";
import { getAIProvider, improveUploadedResumeToContent } from "@/lib/ai/service";
import {
  extractTextFromUpload,
  kindFromFileNameOrType,
  type UploadFileKind,
} from "@/lib/resume/parse-upload";
import type { ResumeContent } from "@/lib/resume/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;

function titleFromContent(fullName?: string) {
  const base = fullName?.trim();
  if (base) {
    return `${base.slice(0, 80)} — imported`;
  }
  return "Imported resume";
}

export async function POST(request: Request) {
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
  const kindRaw = kindFromFileNameOrType(file);
  if (kindRaw === "msword" || !kindRaw) {
    return NextResponse.json(
      {
        error:
          kindRaw === "msword"
            ? "Legacy .doc files are not supported. Please save as .docx and upload again."
            : "Use PDF, DOCX, or TXT (under 5 MB).",
      },
      { status: 400 },
    );
  }
  const kind: UploadFileKind = kindRaw;

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
    console.error("[api/builder/parse-upload] extract", err);
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
          "Could not read your resume. Please upload a text-based PDF or DOCX, or a longer .txt file.",
      },
      { status: 422 },
    );
  }

  let content: ResumeContent;
  try {
    const provider = getAIProvider();
    const raw = await improveUploadedResumeToContent(provider, text);
    content = {
      ...raw,
      meta: { ...raw.meta, templateSelectionComplete: true },
    };
  } catch (err) {
    console.error(
      "[api/builder/parse-upload] ai",
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.json(
      { error: "Could not parse this resume with AI. Try a simpler file." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    content,
    title: titleFromContent(content.contact.fullName),
  });
}
