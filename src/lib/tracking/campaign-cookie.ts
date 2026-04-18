import type { NextRequest, NextResponse } from "next/server";

/** First-touch campaign id from `?ad_id=` */
export const CAMPAIGN_AD_ID_COOKIE = "campaign_ad_id";

/** 30 days (within requested 7–30 day window). */
export const CAMPAIGN_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30;

function cookieOptions(request: NextRequest) {
  return {
    httpOnly: true,
    /** `NODE_ENV` is unreliable on Edge; derive from the incoming request. */
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax" as const,
    path: "/",
    maxAge: CAMPAIGN_COOKIE_MAX_AGE_SEC,
  };
}

/**
 * If the URL has `ad_id` and the cookie is not already set, persist it (first touch only).
 * Never throws — failures are logged and ignored so navigation is not broken.
 */
export function maybeSetCampaignAdIdCookie(
  request: NextRequest,
  response: NextResponse,
): void {
  const hasAdParam = request.nextUrl.searchParams.has("ad_id");
  if (!hasAdParam) {
    return;
  }

  const cookiePresent = Boolean(
    request.cookies.get(CAMPAIGN_AD_ID_COOKIE)?.value,
  );
  console.log("[campaign-cookie] ad_id param seen", {
    cookieAlreadyPresent: cookiePresent,
  });

  if (cookiePresent) {
    console.log("[campaign-cookie] skip (first-touch: keep existing cookie)");
    return;
  }

  const raw = request.nextUrl.searchParams.get("ad_id")?.trim() ?? "";
  if (!raw || raw.length > 128) {
    console.log("[campaign-cookie] ad_id invalid", { reason: "empty_or_long" });
    return;
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(raw)) {
    console.log("[campaign-cookie] ad_id invalid", { reason: "charset" });
    return;
  }

  console.log("[campaign-cookie] ad_id valid", { length: raw.length });

  try {
    response.cookies.set(CAMPAIGN_AD_ID_COOKIE, raw, cookieOptions(request));
    console.log("[campaign-cookie] cookie set ok");
  } catch (err) {
    console.error(
      "[campaign-cookie] cookie set failed (ignored)",
      err instanceof Error ? err.message : String(err),
    );
  }
}
