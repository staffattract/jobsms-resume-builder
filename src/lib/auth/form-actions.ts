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
  getConfiguredAdminAnalyticsEmail,
  isAdminAnalyticsAuthorized,
} from "@/lib/auth/admin-access";
import { sendVerificationEmailForUserEmail } from "@/lib/auth/email-verification-actions";
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
    console.log("[auth:register] validation fail", { reason: "missing_fields" });
    return { error: "Email and password are required" };
  }
  if (password.length < 8) {
    console.log("[auth:register] validation fail", { reason: "password_short" });
    return { error: "Password must be at least 8 characters" };
  }

  try {
    const user = await createUserWithCredentials({
      email,
      password,
      name: nameRaw || undefined,
    });

    const emailSend = await sendVerificationEmailForUserEmail(user.email);
    if (!emailSend.ok) {
      console.error("[auth:register] verification email failed", emailSend.error);
    }

    const token = await createDbSession(user.id);
    await setAuthSessionCookie(token);
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      console.log("[auth:register] validation fail", { reason: "duplicate_email" });
      return { error: "An account with this email already exists" };
    }
    console.error(
      "[auth:register] caught error",
      e instanceof Error ? e.message : String(e),
    );
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/verify-email");
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  console.log("[auth:login] action start");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    console.log("[auth:login] validation fail", { reason: "missing_fields" });
    return { error: "Email and password are required" };
  }

  try {
    const user = await authenticateUserCredentials(email, password);
    if (!user) {
      console.log("[auth:login] auth fail", { reason: "invalid_credentials" });
      return { error: "Invalid email or password" };
    }

    console.log("[auth:login] auth success", { userId: user.id });

    const store = await cookies();
    const existing = store.get(AUTH_SESSION_COOKIE)?.value;
    if (existing) {
      await deleteSessionByToken(existing);
    }

    const token = await createDbSession(user.id);
    await setAuthSessionCookie(token);
  } catch (e) {
    console.error(
      "[auth:login] caught error",
      e instanceof Error ? e.message : String(e),
    );
    return { error: "Something went wrong. Please try again." };
  }

  console.log("[auth:login] redirect", { target: "/resumes" });
  redirect("/resumes");
}

export async function adminLoginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!getConfiguredAdminAnalyticsEmail()) {
    return { error: "Admin access is not configured (missing ADMIN_ANALYTICS_EMAIL)." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await authenticateUserCredentials(email, password);
  if (!user) {
    return { error: "Invalid email or password" };
  }

  if (!isAdminAnalyticsAuthorized(user.email)) {
    return { error: "This account is not authorized for admin access." };
  }

  const store = await cookies();
  const existing = store.get(AUTH_SESSION_COOKIE)?.value;
  if (existing) {
    await deleteSessionByToken(existing);
  }

  const token = await createDbSession(user.id);
  await setAuthSessionCookie(token);
  redirect("/admin/dashboard");
}

export async function adminLogoutAction(): Promise<void> {
  const store = await cookies();
  const token = store.get(AUTH_SESSION_COOKIE)?.value;
  if (token) {
    await deleteSessionByToken(token);
  }
  await clearAuthSessionCookie();
  redirect("/admin/login");
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
