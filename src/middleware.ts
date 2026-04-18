import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE } from "@/lib/auth/constants";
import { maybeSetCampaignAdIdCookie } from "@/lib/tracking/campaign-cookie";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
  const path = request.nextUrl.pathname;

  const finish = (res: NextResponse) => {
    maybeSetCampaignAdIdCookie(request, res);
    return res;
  };

  if (path === "/reset-password") {
    return finish(NextResponse.next());
  }

  const publicAuthRecovery =
    path === "/login" ||
    path.startsWith("/login/") ||
    path === "/register" ||
    path === "/forgot-password" ||
    path === "/forgot-email";

  if (publicAuthRecovery) {
    if (token) {
      return finish(
        NextResponse.redirect(new URL("/resumes", request.url)),
      );
    }
    return finish(NextResponse.next());
  }

  if (path === "/admin" || path.startsWith("/admin/login")) {
    return finish(NextResponse.next());
  }

  if (path.startsWith("/admin/")) {
    if (!token) {
      return finish(
        NextResponse.redirect(new URL("/admin/login", request.url)),
      );
    }
    return finish(NextResponse.next());
  }

  if (path.startsWith("/dashboard") || path.startsWith("/resumes")) {
    if (!token) {
      return finish(
        NextResponse.redirect(new URL("/login", request.url)),
      );
    }
    return finish(NextResponse.next());
  }

  return finish(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
