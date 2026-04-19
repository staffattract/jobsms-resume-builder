import { NextResponse } from "next/server";
import type { User } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/current-user";

/**
 * For Route Handlers: require a session and verified email (same rule as `requireUser` for pages).
 */
export async function requireVerifiedSessionUser(): Promise<
  User | NextResponse
> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user.emailVerifiedAt) {
    return NextResponse.json({ error: "Email not verified" }, { status: 403 });
  }
  return user;
}
