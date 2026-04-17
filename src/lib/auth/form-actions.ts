"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_SESSION_COOKIE } from "@/lib/auth/constants";
import {
  createDbSession,
  deleteSessionByToken,
  setAuthSessionCookie,
  clearAuthSessionCookie,
} from "@/lib/auth/session";
import {
  authenticateUserCredentials,
  createUserWithCredentials,
  isUniqueConstraintError,
} from "@/lib/auth/users";

export type AuthFormState = { error?: string };

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nameRaw = String(formData.get("name") ?? "").trim();

  if (!email || !password) {
    return { error: "Email and password are required" };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  try {
    const user = await createUserWithCredentials({
      email,
      password,
      name: nameRaw || undefined,
    });
    const token = await createDbSession(user.id);
    await setAuthSessionCookie(token);
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      return { error: "An account with this email already exists" };
    }
    throw e;
  }
  redirect("/resumes");
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await authenticateUserCredentials(email, password);
  if (!user) {
    return { error: "Invalid email or password" };
  }

  const store = await cookies();
  const existing = store.get(AUTH_SESSION_COOKIE)?.value;
  if (existing) {
    await deleteSessionByToken(existing);
  }

  const token = await createDbSession(user.id);
  await setAuthSessionCookie(token);
  redirect("/resumes");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  const token = store.get(AUTH_SESSION_COOKIE)?.value;
  if (token) {
    await deleteSessionByToken(token);
  }
  await clearAuthSessionCookie();
  redirect("/login");
}
