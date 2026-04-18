import type { NextRequest, NextResponse } from "next/server";

/** First-touch campaign id from `?ad_id=` (not HttpOnly so it can be read in Route Handlers consistently; still first-party). */
export const CAMPAIGN_AD_ID_COOKIE = "campaign_ad_id";

/** 30 days (within requested 7–30 day window). */
export const CAMPAIGN_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30;

export function campaignAdIdCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: CAMPAIGN_COOKIE_MAX_AGE_SEC,
  };
}

/**
 * If the URL has `ad_id` and the cookie is not already set, persist it (first touch only).
 */
export function maybeSetCampaignAdIdCookie(
  request: NextRequest,
  response: NextResponse,
): void {
  if (request.cookies.get(CAMPAIGN_AD_ID_COOKIE)?.value) {
    return;
  }
  const raw = request.nextUrl.searchParams.get("ad_id")?.trim();
  if (!raw || raw.length > 128) {
    return;
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(raw)) {
    return;
  }
  response.cookies.set(CAMPAIGN_AD_ID_COOKIE, raw, campaignAdIdCookieOptions());
}
