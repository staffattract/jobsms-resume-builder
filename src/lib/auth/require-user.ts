import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { User } from "@/generated/prisma/client";

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.emailVerifiedAt) {
    redirect("/verify-email");
  }
  return user;
}
