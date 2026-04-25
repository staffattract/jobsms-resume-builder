import { NextResponse } from "next/server";
import { getAIProvider, fillPartialResumeFromAi } from "@/lib/ai/service";
import { normalizeResumeContent, type ResumeContent } from "@/lib/resume/types";
import { canRunPartialAiFill } from "@/lib/builder/merge-partial-fill";

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
  if (!canRunPartialAiFill(content)) {
    return NextResponse.json(
      {
        error:
          "Add a target job title or some work experience before using AI fill.",
      },
      { status: 400 },
    );
  }
  try {
    const provider = getAIProvider();
    const next: ResumeContent = await fillPartialResumeFromAi(provider, content);
    return NextResponse.json({ content: next });
  } catch (err) {
    console.error(
      "[api/builder/fill-partial]",
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.json(
      { error: "Could not fill the resume. Try again in a moment." },
      { status: 502 },
    );
  }
}
