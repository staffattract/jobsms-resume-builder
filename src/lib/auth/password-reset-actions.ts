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

  const normalizedEmail = normalizeEmail(emailRaw);

  try {
    await timingPadding();

    console.log("[password-reset] LOOKUP_START", {
      normalizedLen: normalizedEmail.length,
    });
    const user = await findUserByEmail(normalizedEmail);
    if (!user?.passwordHash) {
      console.log("[password-reset] USER_SKIP", {
        reason: user ? "no_password_hash" : "no_user",
      });
      return { ok: true };
    }

    console.log("[password-reset] USER_FOUND", { userId: user.id });

    const token = generatePasswordResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    let rowId: string | null = null;
    try {
      const row = await prisma.$transaction(async (tx) => {
        const del = await tx.passwordResetToken.deleteMany({
          where: { email: normalizedEmail },
        });
        console.log("[password-reset] DELETE_OK", { deletedCount: del.count });

        const created = await tx.passwordResetToken.create({
          data: {
            email: normalizedEmail,
            token,
            expiresAt,
          },
        });
        console.log("[password-reset] CREATE_OK", { rowId: created.id });
        return created;
      });
      rowId = row.id;
    } catch (error) {
      console.error("RESET_ERROR:", error);
      return { error: GENERIC_REQUEST_FAILURE };
    }

    const resetUrl = buildPasswordResetUrl(token);
    if (!resetUrl) {
      if (rowId) {
        await prisma.passwordResetToken.delete({ where: { id: rowId } }).catch(() => {});
      }
      console.error(
        "[password-reset] RESET_URL_MISSING",
        "check NEXT_PUBLIC_APP_URL / APP_URL / VERCEL_URL",
      );
      return { ok: true };
    }

    console.log("[password-reset] SEND_START");
    const send = await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
    });

    if (!send.ok) {
      if (rowId) {
        await prisma.passwordResetToken.delete({ where: { id: rowId } }).catch(() => {});
      }
      console.error("[password-reset] EMAIL_SEND_FAILED", send.error);
      return { ok: true };
    }

    console.log("[password-reset] EMAIL_SENT");
    return { ok: true };
  } catch (error) {
    console.error("[password-reset] REQUEST_OUTER_ERROR", error);
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
