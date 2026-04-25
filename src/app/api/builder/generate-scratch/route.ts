import { NextResponse } from "next/server";
import { getAIProvider, generateScratchResumeContent } from "@/lib/ai/service";
import { MAX_SCRATCH_CONTEXT_CHARS, MAX_SCRATCH_TITLE } from "@/lib/ai/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { jobTitle?: string; experienceOrResume?: string };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const jobTitle = String(body.jobTitle ?? "").trim();
  if (!jobTitle) {
    return NextResponse.json({ error: "Job title is required" }, { status: 400 });
  }
  if (jobTitle.length > MAX_SCRATCH_TITLE) {
    return NextResponse.json(
      { error: `Job title is too long (max ${MAX_SCRATCH_TITLE} characters).` },
      { status: 400 },
    );
  }

  const experienceOrResume = String(body.experienceOrResume ?? "");
  if (experienceOrResume.length > MAX_SCRATCH_CONTEXT_CHARS) {
    return NextResponse.json(
      { error: "Pasted text is too long. Shorten and try again." },
      { status: 400 },
    );
  }

  try {
    const provider = getAIProvider();
    const content = await generateScratchResumeContent(
      provider,
      jobTitle,
      experienceOrResume,
    );
    return NextResponse.json({ content, title: jobTitle });
  } catch (err) {
    console.error(
      "[api/builder/generate-scratch]",
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.json(
      { error: "Could not generate a resume. Try again in a moment." },
      { status: 502 },
    );
  }
}
