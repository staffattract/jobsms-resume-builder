import { NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/analytics/record-event";
import {
  type PublicAiBuilderJsonRouteKey,
  type PublicAiProtectedRouteKey,
  rateLimitPolicyForJsonRoute,
  rateLimitPolicyForParseUpload,
} from "@/lib/api/public-ai-route-config";
import {
  extractRequestClientIp,
  slidingWindowConsume,
} from "@/lib/api/public-ai-rate-limit-memory";

function maskIpForLogs(ip: string): string {
  if (ip === "unknown") {
    return "unknown";
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    const parts = ip.split(".");
    parts[3] = "x";
    return parts.join(".");
  }
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return `${parts.slice(0, 4).join(":")}:`;
  }
  return "(non-ip)";
}

/**
 * Applies per-route sliding-window counts for this server instance (`route:clientIp`).
 *
 * Records `PUBLIC_AI_RATE_LIMIT_HIT` analytics (no secrets; subnet-style hint only).
 */
export async function consumePublicAiRateLimitOrRespond(
  request: Request,
  route: PublicAiProtectedRouteKey,
  maxHits: number,
  windowMs: number,
): Promise<NextResponse | null> {
  const ip = extractRequestClientIp(request);
  const key = `${route}:${ip}`;
  const gate = slidingWindowConsume(key, maxHits, windowMs);
  if (gate.ok) {
    return null;
  }

  await recordAnalyticsEvent({
    type: "PUBLIC_AI_RATE_LIMIT_HIT",
    userId: null,
    metadata: {
      route,
      clientSubnetHint: maskIpForLogs(ip),
    },
  });

  console.warn(
    `[public-ai] rate limit (${route}) client=${maskIpForLogs(ip)}`,
  );

  const retryAfterSeconds = gate.retryAfterSeconds ?? 60;
  return NextResponse.json(
    {
      error:
        "Too many AI requests from this connection. Wait a minute and try again.",
      code: "RATE_LIMITED",
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}

export async function consumePublicAiJsonRouteRateLimitOrRespond(
  request: Request,
  route: PublicAiBuilderJsonRouteKey,
): Promise<NextResponse | null> {
  const p = rateLimitPolicyForJsonRoute(route);
  return consumePublicAiRateLimitOrRespond(
    request,
    route,
    p.maxPerWindow,
    p.windowMs,
  );
}

export async function consumePublicAiParseUploadRateLimitOrRespond(
  request: Request,
): Promise<NextResponse | null> {
  const p = rateLimitPolicyForParseUpload();
  return consumePublicAiRateLimitOrRespond(
    request,
    "parse-upload",
    p.maxPerWindow,
    p.windowMs,
  );
}

/**
 * Abort early when Content-Length on multipart uploads exceeds envelope budget.
 */
export function rejectOversizedMultipartEnvelope(
  request: Request,
  maxBytes: number,
): NextResponse | null {
  const cl = request.headers.get("content-length");
  if (cl === null || cl.trim() === "") {
    return null;
  }
  const n = Number.parseInt(cl, 10);
  if (!Number.isFinite(n) || n < 0) {
    return NextResponse.json(
      { error: "Invalid Content-Length header.", code: "INVALID_CONTENT_LENGTH" },
      { status: 400 },
    );
  }
  if (n > maxBytes) {
    return NextResponse.json(
      {
        error: "Uploaded request is too large.",
        code: "REQUEST_TOO_LARGE",
        maxRequestBytes: maxBytes,
      },
      { status: 413 },
    );
  }
  return null;
}
