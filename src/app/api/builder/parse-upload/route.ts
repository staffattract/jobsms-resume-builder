import { NextResponse } from "next/server";
import {
  consumePublicAiParseUploadRateLimitOrRespond,
  rejectOversizedMultipartEnvelope,
} from "@/lib/api/public-ai-guard";
import { rateLimitPolicyForParseUpload } from "@/lib/api/public-ai-route-config";
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
  const limited = await consumePublicAiParseUploadRateLimitOrRespond(request);
  if (limited) {
    return limited;
  }

  const uploadPolicy = rateLimitPolicyForParseUpload();
  const envelope = rejectOversizedMultipartEnvelope(
    request,
    uploadPolicy.maxMultipartBytes,
  );
  if (envelope) {
    return envelope;
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data", code: "FORM_DATA_PARSE_ERROR" },
      { status: 400 },
    );
  }

  const entry = formData.get("file");
  if (!entry || typeof entry === "string") {
    return NextResponse.json(
      { error: "Missing file", code: "MISSING_FILE" },
      { status: 400 },
    );
  }
  if (!("arrayBuffer" in entry)) {
    return NextResponse.json(
      { error: "Invalid file", code: "INVALID_FILE" },
      { status: 400 },
    );
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
        code: kindRaw === "msword" ? "UNSUPPORTED_LEGACY_DOC" : "UNSUPPORTED_KIND",
      },
      { status: 400 },
    );
  }
  const kind: UploadFileKind = kindRaw;

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0 || buffer.length > MAX_BYTES) {
    return NextResponse.json(
      {
        error: "File must be under 5 MB and non-empty.",
        code: "FILE_SIZE_INVALID",
      },
      { status: 400 },
    );
  }

  let text: string;
  try {
    text = await extractTextFromUpload(buffer, kind);
  } catch (err) {
    console.error("[api/builder/parse-upload] extract", err);
    return NextResponse.json(
      {
        error: "Could not read that file. Try another export.",
        code: "FILE_EXTRACT_FAILED",
      },
      { status: 422 },
    );
  }

  if (!text.trim()) {
    return NextResponse.json(
      {
        error: "No text could be extracted from this file.",
        code: "EMPTY_EXTRACTED_TEXT",
      },
      { status: 422 },
    );
  }

  if (text.trim().length < 200) {
    return NextResponse.json(
      {
        error:
          "Could not read your resume. Please upload a text-based PDF or DOCX, or a longer .txt file.",
        code: "EXTRACT_TOO_SHORT",
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
      {
        error: "Could not parse this resume with AI. Try a simpler file.",
        code: "AI_GENERATION_FAILED",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    content,
    title: titleFromContent(content.contact.fullName),
  });
}
