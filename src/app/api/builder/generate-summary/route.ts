import { NextResponse } from "next/server";
import { consumePublicAiJsonRouteRateLimitOrRespond } from "@/lib/api/public-ai-guard";
import { parsePublicAiJsonBody } from "@/lib/api/public-ai-json-body";
import { rateLimitPolicyForJsonRoute } from "@/lib/api/public-ai-route-config";
import { getAIProvider, generateSummary } from "@/lib/ai/service";
import { normalizeResumeContent } from "@/lib/resume/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROUTE = "generate-summary" as const;

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
      {
        error: "Could not generate a summary. Try again.",
        code: "AI_GENERATION_FAILED",
      },
      { status: 502 },
    );
  }
}
