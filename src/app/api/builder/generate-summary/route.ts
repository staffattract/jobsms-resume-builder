import { NextResponse } from "next/server";
import { getAIProvider, generateSummary } from "@/lib/ai/service";
import { normalizeResumeContent, type ResumeContent } from "@/lib/resume/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { content?: unknown };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const content = normalizeResumeContent(body.content);
  try {
    const provider = getAIProvider();
    const suggestion = await generateSummary(provider, content);
    return NextResponse.json({ suggestion });
  } catch (err) {
    console.error(
      "[api/builder/generate-summary]",
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.json(
      { error: "Could not generate a summary. Try again." },
      { status: 502 },
    );
  }
}
