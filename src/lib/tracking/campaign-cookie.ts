import type { NextRequest, NextResponse } from "next/server";

/** First-touch campaign id from `?ad_id=` */
export const CAMPAIGN_AD_ID_COOKIE = "campaign_ad_id";

/** 30 days (within requested 7–30 day window). */
export const CAMPAIGN_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30;

function cookieOptions(request: NextRequest) {
  return {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax" as const,
    path: "/",
    maxAge: CAMPAIGN_COOKIE_MAX_AGE_SEC,
  };
}

/**
 * Campaign cookie must never run on POST (Server Actions), /api, or auth pages —
 * mutating those responses breaks submissions.
 */
export function shouldRunCampaignTracking(request: NextRequest): boolean {
  if (request.method !== "GET") {
    return false;
  }
  const path = request.nextUrl.pathname;
  if (path.startsWith("/api")) {
    return false;
  }
  if (
    path === "/login" ||
    path.startsWith("/login/") ||
    path === "/register" ||
    path.startsWith("/register/") ||
    path === "/admin/login" ||
    path.startsWith("/admin/login/") ||
    path === "/forgot-password" ||
    path.startsWith("/forgot-password/") ||
    path === "/reset-password" ||
    path.startsWith("/reset-password/")
  ) {
    return false;
  }
  return true;
}

/**
 * If the URL has `ad_id` and the cookie is not already set, persist it (first touch only).
 * Call only for GET + `shouldRunCampaignTracking` === true. Never throws.
 */
export function maybeSetCampaignAdIdCookie(
  request: NextRequest,
  response: NextResponse,
): void {
  if (!shouldRunCampaignTracking(request)) {
    return;
  }

  if (!request.nextUrl.searchParams.has("ad_id")) {
    return;
  }

  if (request.cookies.get(CAMPAIGN_AD_ID_COOKIE)?.value) {
    return;
  }

  const raw = request.nextUrl.searchParams.get("ad_id")?.trim() ?? "";
  if (!raw || raw.length > 128) {
    return;
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(raw)) {
    return;
  }

  try {
    response.cookies.set(CAMPAIGN_AD_ID_COOKIE, raw, cookieOptions(request));
  } catch (err) {
    console.error(
      "[campaign-cookie] set failed (ignored)",
      err instanceof Error ? err.message : String(err),
    );
  }
}
