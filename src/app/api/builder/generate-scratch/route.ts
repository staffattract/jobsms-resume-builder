import { NextResponse } from "next/server";
import { consumePublicAiJsonRouteRateLimitOrRespond } from "@/lib/api/public-ai-guard";
import { parsePublicAiJsonBody } from "@/lib/api/public-ai-json-body";
import { rateLimitPolicyForJsonRoute } from "@/lib/api/public-ai-route-config";
import { getAIProvider, generateScratchResumeContent } from "@/lib/ai/service";
import { MAX_SCRATCH_CONTEXT_CHARS, MAX_SCRATCH_TITLE } from "@/lib/ai/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROUTE = "generate-scratch" as const;

type Body = { jobTitle?: string; experienceOrResume?: string };

export async function POST(request: Request) {
  const limited = await consumePublicAiJsonRouteRateLimitOrRespond(
    request,
    ROUTE,
  );
  if (limited) {
    return limited;
  }

  const maxBytes = rateLimitPolicyForJsonRoute(ROUTE).maxBodyUtf8Bytes;
  const parsed = await parsePublicAiJsonBody(request, maxBytes);
  if (!parsed.ok) {
    return parsed.response;
  }

  const body = parsed.data as Body;
  const jobTitle = String(body.jobTitle ?? "").trim();
  if (!jobTitle) {
    return NextResponse.json(
      { error: "Job title is required", code: "MISSING_JOB_TITLE" },
      { status: 400 },
    );
  }
  if (jobTitle.length > MAX_SCRATCH_TITLE) {
    return NextResponse.json(
      {
        error: `Job title is too long (max ${MAX_SCRATCH_TITLE} characters).`,
        code: "JOB_TITLE_TOO_LONG",
      },
      { status: 400 },
    );
  }

  const experienceOrResume = String(body.experienceOrResume ?? "");
  if (experienceOrResume.length > MAX_SCRATCH_CONTEXT_CHARS) {
    return NextResponse.json(
      {
        error: "Pasted text is too long. Shorten and try again.",
        code: "EXPERIENCE_TEXT_TOO_LONG",
      },
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
      {
        error: "Could not generate a resume. Try again in a moment.",
        code: "AI_GENERATION_FAILED",
      },
      { status: 502 },
    );
  }
}
