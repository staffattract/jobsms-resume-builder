import { NextResponse } from "next/server";
import {
  consumePublicAiJsonRouteRateLimitOrRespond,
} from "@/lib/api/public-ai-guard";
import { parsePublicAiJsonBody } from "@/lib/api/public-ai-json-body";
import {
  rateLimitPolicyForJsonRoute,
} from "@/lib/api/public-ai-route-config";
import { getAIProvider, improveBullet } from "@/lib/ai/service";
import { MAX_BULLET_CHARS } from "@/lib/ai/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROUTE = "improve-bullet" as const;

type Body = { text?: string };

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
  const text = String(body.text ?? "");
  if (!text.trim()) {
    return NextResponse.json(
      {
        error: "Bullet text is required",
        code: "MISSING_TEXT",
      },
      { status: 400 },
    );
  }
  if (text.length > MAX_BULLET_CHARS) {
    return NextResponse.json(
      {
        error:
          "Text is too long. Shorten the bullet and try again.",
        code: "TEXT_TOO_LONG",
      },
      { status: 400 },
    );
  }
  try {
    const provider = getAIProvider();
    const suggestion = await improveBullet(provider, text);
    return NextResponse.json({ suggestion });
  } catch (err) {
    console.error(
      "[api/builder/improve-bullet]",
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.json(
      {
        error: "Could not improve this bullet. Try again.",
        code: "AI_GENERATION_FAILED",
      },
      { status: 502 },
    );
  }
}
