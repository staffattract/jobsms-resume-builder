"use server";

import { prisma } from "@/lib/db";
import {
  buildConfirmEmailUrl,
  sendEmailVerificationEmail,
} from "@/lib/email/resend-send";
import { generatePasswordResetToken } from "@/lib/auth/reset-token";
import { findUserByEmail, normalizeEmail } from "@/lib/auth/users";
import { getCurrentUser } from "@/lib/auth/current-user";
import type {
  EmailVerificationConfirmState,
  ResendVerificationState,
} from "@/lib/auth/email-verification-types";

const VERIFY_LINK_INVALID_MESSAGE =
  "This confirmation link is invalid or has expired.";

function verifyEmailErrorFields(e: unknown): {
  name: string;
  message: string;
  code?: string;
} {
  if (e instanceof Error) {
    const codeRaw = (e as { code?: string | number }).code;
    const code =
      codeRaw !== undefined && codeRaw !== null ? String(codeRaw) : undefined;
    return { name: e.name, message: e.message, ...(code ? { code } : {}) };
  }
  return { name: "non-Error", message: String(e) };
}

/** Creates a fresh single-use token (24h). Does not log the token. */
async function issueEmailVerificationTokenForEmail(
  email: string,
): Promise<string> {
  console.log("[verify-email] TOKEN_CREATE_START");
  const normalizedEmail = normalizeEmail(email);
  const token = generatePasswordResetToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.$transaction(async (tx) => {
    await tx.emailVerificationToken.deleteMany({
      where: { email: normalizedEmail },
    });
    await tx.emailVerificationToken.create({
      data: { email: normalizedEmail, token, expiresAt },
    });
  });
  console.log("[verify-email] TOKEN_CREATE_SUCCESS");
  return token;
}

export async function sendVerificationEmailForUserEmail(
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalizedEmail = normalizeEmail(email);
  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    return { ok: false, error: "Account not found." };
  }
  if (user.emailVerifiedAt) {
    return { ok: true };
  }

  try {
    const token = await issueEmailVerificationTokenForEmail(normalizedEmail);
    const confirmUrl = buildConfirmEmailUrl(token);
    if (!confirmUrl) {
      console.error("[verify-email] EMAIL_SEND_FAILED", {
        message: "confirm_url_missing_check_APP_URL",
      });
      return { ok: false, error: "Email could not be sent (app URL not configured)." };
    }
    console.log("[verify-email] EMAIL_SEND_START");
    const send = await sendEmailVerificationEmail({
      to: user.email,
      confirmUrl,
    });
    if (!send.ok) {
      const hint = send.error.slice(0, 160);
      console.error("[verify-email] EMAIL_SEND_FAILED", { message: hint });
      return { ok: false, error: "We could not send the email. Please try again shortly." };
    }
    console.log("[verify-email] EMAIL_SEND_SUCCESS");
    return { ok: true };
  } catch (e) {
    console.error("[verify-email] OUTER_ERROR", verifyEmailErrorFields(e));
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function resendEmailVerificationAction(
  _prev: ResendVerificationState,
  _formData: FormData,
): Promise<ResendVerificationState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You need to be signed in to resend the confirmation email." };
  }
  if (user.emailVerifiedAt) {
    return { ok: true };
  }

  const result = await sendVerificationEmailForUserEmail(user.email);
  if (!result.ok) {
    return { error: result.error };
  }
  return { ok: true };
}

export async function confirmEmailAction(
  _prev: EmailVerificationConfirmState,
  formData: FormData,
): Promise<EmailVerificationConfirmState> {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) {
    return { error: "Missing confirmation token.", invalidToken: true };
  }

  const row = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!row || row.expiresAt <= new Date()) {
    return { error: VERIFY_LINK_INVALID_MESSAGE, invalidToken: true };
  }

  const user = await findUserByEmail(row.email);
  if (!user) {
    await prisma.emailVerificationToken.deleteMany({
      where: { email: row.email },
    });
    return { error: VERIFY_LINK_INVALID_MESSAGE, invalidToken: true };
  }

  if (user.emailVerifiedAt) {
    await prisma.emailVerificationToken.deleteMany({
      where: { email: row.email },
    });
    return { succeeded: true, alreadyVerified: true };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });
    await tx.emailVerificationToken.deleteMany({
      where: { email: row.email },
    });
  });

  return { succeeded: true };
}
