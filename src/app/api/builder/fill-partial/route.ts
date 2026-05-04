import { NextResponse } from "next/server";
import { consumePublicAiJsonRouteRateLimitOrRespond } from "@/lib/api/public-ai-guard";
import { parsePublicAiJsonBody } from "@/lib/api/public-ai-json-body";
import { rateLimitPolicyForJsonRoute } from "@/lib/api/public-ai-route-config";
import { getAIProvider, fillPartialResumeFromAi } from "@/lib/ai/service";
import { normalizeResumeContent, type ResumeContent } from "@/lib/resume/types";
import { canRunPartialAiFill } from "@/lib/builder/merge-partial-fill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROUTE = "fill-partial" as const;

type Body = { content?: unknown };

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

  const payload = parsed.data as Body;
  const content = normalizeResumeContent(payload.content);
  if (!canRunPartialAiFill(content)) {
    return NextResponse.json(
      {
        error:
          "Add a target job title or some work experience before using AI fill.",
        code: "INSUFFICIENT_CONTENT",
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
      {
        error:
          "Could not fill the resume. Try again in a moment.",
        code: "AI_GENERATION_FAILED",
      },
      { status: 502 },
    );
  }
}
