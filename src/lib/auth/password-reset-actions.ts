"use server";

import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { generatePasswordResetToken } from "@/lib/auth/reset-token";
import { findUserByEmail, normalizeEmail } from "@/lib/auth/users";
import {
  buildPasswordResetUrl,
  sendPasswordResetEmail,
} from "@/lib/email/resend-send";
import { RESET_LINK_INVALID_MESSAGE } from "@/lib/auth/password-reset-constants";

/** `ok` = generic success (no enumeration). `error` = validation or generic system failure. */
export type PasswordResetRequestState = { ok?: boolean; error?: string };

const GENERIC_REQUEST_FAILURE =
  "We couldn’t send a reset link right now. Please try again in a few minutes.";
export type PasswordResetCompleteState = {
  error?: string;
  invalidToken?: boolean;
  /** Client navigates to `/login?reset=success` (same origin as the open tab). */
  succeeded?: boolean;
};

/** Constant-time-ish work so missing accounts don’t return much faster than hits. */
async function timingPadding(): Promise<void> {
  await hashPassword(`pad:${randomUUID()}`);
}

export async function requestPasswordResetAction(
  _prev: PasswordResetRequestState,
  formData: FormData,
): Promise<PasswordResetRequestState> {
  const emailRaw = String(formData.get("email") ?? "").trim();
  if (!emailRaw) {
    return { error: "Email is required" };
  }

  try {
    await timingPadding();

    const user = await findUserByEmail(emailRaw);
    if (!user?.passwordHash) {
      return { ok: true };
    }

    const email = normalizeEmail(user.email);
    const token = generatePasswordResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    let rowId: string | null = null;
    try {
      const row = await prisma.$transaction(async (tx) => {
        await tx.passwordResetToken.deleteMany({ where: { email } });
        return tx.passwordResetToken.create({
          data: { email, token, expiresAt },
        });
      });
      rowId = row.id;
    } catch {
      console.error("[password-reset] Token persist failed");
      return { error: GENERIC_REQUEST_FAILURE };
    }

    const resetUrl = buildPasswordResetUrl(token);
    if (!resetUrl) {
      if (rowId) {
        await prisma.passwordResetToken.delete({ where: { id: rowId } }).catch(() => {});
      }
      console.error(
        "[password-reset] Missing NEXT_PUBLIC_APP_URL (or APP_URL / VERCEL_URL)",
      );
      return { ok: true };
    }

    const send = await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
    });

    if (!send.ok) {
      if (rowId) {
        await prisma.passwordResetToken.delete({ where: { id: rowId } }).catch(() => {});
      }
      console.error("[password-reset] Email send failed");
      return { ok: true };
    }

    return { ok: true };
  } catch {
    console.error("[password-reset] Request failed");
    return { error: GENERIC_REQUEST_FAILURE };
  }
}

export async function completePasswordResetAction(
  _prev: PasswordResetCompleteState,
  formData: FormData,
): Promise<PasswordResetCompleteState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token) {
    return { error: "Missing reset token.", invalidToken: true };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match" };
  }

  const row = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!row || row.expiresAt <= new Date()) {
    return { error: RESET_LINK_INVALID_MESSAGE, invalidToken: true };
  }

  const user = await findUserByEmail(row.email);
  if (!user?.passwordHash) {
    await prisma.passwordResetToken.deleteMany({ where: { email: row.email } });
    return { error: RESET_LINK_INVALID_MESSAGE, invalidToken: true };
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    await tx.passwordResetToken.deleteMany({
      where: { email: row.email },
    });
    await tx.session.deleteMany({ where: { userId: user.id } });
  });

  return { succeeded: true };
}
