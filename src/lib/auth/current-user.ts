import { cookies } from "next/headers";
import { AUTH_SESSION_COOKIE } from "@/lib/auth/constants";
import { getSessionUserFromToken } from "@/lib/auth/session";
import type { User } from "@/generated/prisma/client";

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(AUTH_SESSION_COOKIE)?.value;
  const result = await getSessionUserFromToken(token);
  return result?.user ?? null;
}
