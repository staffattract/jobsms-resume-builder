"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import {
  generatePasswordResetSecret,
  hashPasswordResetToken,
} from "@/lib/auth/reset-token";
import { findUserByEmail } from "@/lib/auth/users";
import {
  buildPasswordResetUrl,
  sendPasswordResetEmail,
} from "@/lib/email/resend-send";

export type PasswordResetRequestState = { ok?: boolean; error?: string };
export type PasswordResetCompleteState = { error?: string };

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

  await timingPadding();

  const user = await findUserByEmail(emailRaw);
  if (!user?.passwordHash) {
    return { ok: true, error: undefined };
  }

  const { raw, hash } = generatePasswordResetSecret();
  const resetUrl = buildPasswordResetUrl(raw);
  if (!resetUrl) {
    console.error(
      "[password-reset] Missing APP_URL (or VERCEL_URL in production) — cannot build reset link",
    );
    return { ok: true, error: undefined };
  }

  const send = await sendPasswordResetEmail({
    to: user.email,
    resetUrl,
  });
  if (!send.ok) {
    console.error("[password-reset] Email send failed:", send.error);
    return { ok: true, error: undefined };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      });
      await tx.passwordResetToken.create({
        data: {
          tokenHash: hash,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
    });
  } catch (e) {
    console.error("[password-reset] Failed to persist token:", e);
    return { ok: true, error: undefined };
  }

  return { ok: true, error: undefined };
}

export async function completePasswordResetAction(
  _prev: PasswordResetCompleteState,
  formData: FormData,
): Promise<PasswordResetCompleteState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token) {
    return { error: "Missing reset token." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match" };
  }

  const tokenHash = hashPasswordResetToken(token);
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!row || row.usedAt !== null || row.expiresAt <= new Date()) {
    return { error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    });
    await tx.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    });
    await tx.passwordResetToken.deleteMany({
      where: { userId: row.userId, id: { not: row.id } },
    });
    await tx.session.deleteMany({ where: { userId: row.userId } });
  });

  redirect("/login?reset=1");
}
