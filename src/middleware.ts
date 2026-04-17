import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE } from "@/lib/auth/constants";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
  const path = request.nextUrl.pathname;

  if (path === "/login" || path.startsWith("/login/")) {
    if (token) {
      return NextResponse.redirect(new URL("/resumes", request.url));
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
  matcher: ["/dashboard/:path*", "/resumes/:path*", "/login"],
};
