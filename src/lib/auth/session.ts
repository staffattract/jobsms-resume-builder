import type { User } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { AUTH_SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { createSessionToken } from "@/lib/auth/session-token";
import { toPublicUser, type PublicUser } from "@/lib/auth/user-public";
import type { NextResponse } from "next/server";

export function sessionCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

/** Set session cookie from a Server Action or Route Handler using `next/headers`. */
export async function setAuthSessionCookie(token: string): Promise<void> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  store.set(AUTH_SESSION_COOKIE, token, sessionCookieOptions());
}

/** Clear session cookie from a Server Action or Route Handler. */
export async function clearAuthSessionCookie(): Promise<void> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  store.set(AUTH_SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
}

export function attachSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_SESSION_COOKIE, token, sessionCookieOptions());
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(AUTH_SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
}

export async function createDbSession(userId: string): Promise<string> {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  await prisma.session.create({
    data: { userId, token, expiresAt },
  });
  return token;
}

export async function deleteSessionByToken(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token } });
}

export async function getSessionUserFromToken(
  token: string | undefined,
): Promise<{ user: User } | null> {
  if (!token) {
    return null;
  }
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }
  return { user: session.user };
}

export function sessionToJson(user: User): { user: PublicUser } {
  return { user: toPublicUser(user) };
}
