import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE } from "@/lib/auth/constants";

// Campaign / ad_id cookie tracking temporarily disabled (was breaking page loads).
// import {
//   maybeSetCampaignAdIdCookie,
//   shouldRunCampaignTracking,
// } from "@/lib/tracking/campaign-cookie";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
  const path = request.nextUrl.pathname;

  if (path === "/reset-password") {
    return NextResponse.next();
  }

  const publicAuthRecovery =
    path === "/login" ||
    path.startsWith("/login/") ||
    path === "/register" ||
    path === "/forgot-password" ||
    path === "/forgot-email";

  if (publicAuthRecovery) {
    if (token) {
      return NextResponse.redirect(new URL("/resumes", request.url));
    }
    return NextResponse.next();
  }

  if (path === "/admin" || path.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  if (path.startsWith("/admin/")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  if (path.startsWith("/dashboard") || path.startsWith("/resumes")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
