import { NextResponse } from "next/server";
import { consumePublicAiJsonRouteRateLimitOrRespond } from "@/lib/api/public-ai-guard";
import { parsePublicAiJsonBody } from "@/lib/api/public-ai-json-body";
import { rateLimitPolicyForJsonRoute } from "@/lib/api/public-ai-route-config";
import { getAIProvider, tailorToJob } from "@/lib/ai/service";
import { MAX_JOB_DESCRIPTION_CHARS } from "@/lib/ai/limits";
import { normalizeResumeContent, type ResumeContent } from "@/lib/resume/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROUTE = "tailor-job" as const;

type Body = { jobDescription?: string; content?: unknown };

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
  const jobDescription = String(body.jobDescription ?? "");
  if (!jobDescription.trim()) {
    return NextResponse.json(
      {
        error: "Job description is required",
        code: "MISSING_JOB_DESCRIPTION",
      },
      { status: 400 },
    );
  }
  if (jobDescription.length > MAX_JOB_DESCRIPTION_CHARS) {
    return NextResponse.json(
      {
        error: "Job description is too long.",
        code: "JOB_DESCRIPTION_TOO_LONG",
      },
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
      {
        error: "Could not tailor the resume. Try again.",
        code: "AI_GENERATION_FAILED",
      },
      { status: 502 },
    );
  }
}
