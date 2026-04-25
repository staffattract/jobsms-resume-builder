import { NextResponse } from "next/server";
import { getAIProvider, tailorToJob } from "@/lib/ai/service";
import { normalizeResumeContent, type ResumeContent } from "@/lib/resume/types";
import { MAX_JOB_DESCRIPTION_CHARS } from "@/lib/ai/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { jobDescription?: string; content?: unknown };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const jobDescription = String(body.jobDescription ?? "");
  if (!jobDescription.trim()) {
    return NextResponse.json(
      { error: "Job description is required" },
      { status: 400 },
    );
  }
  if (jobDescription.length > MAX_JOB_DESCRIPTION_CHARS) {
    return NextResponse.json(
      { error: "Job description is too long." },
      { status: 400 },
    );
  }
  const content = normalizeResumeContent(body.content) as ResumeContent;
  try {
    const provider = getAIProvider();
    const result = await tailorToJob(provider, jobDescription, content);
    return NextResponse.json({
      summary: result.summary,
      alignmentNotes: result.alignmentNotes,
    });
  } catch (err) {
    console.error(
      "[api/builder/tailor-job]",
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.json(
      { error: "Could not tailor the resume. Try again." },
      { status: 502 },
    );
  }
}
