/**
 * Transactional email via [Resend](https://resend.com) HTTP API (no extra npm package).
 */

import { optionalEnvTrim } from "@/lib/env/server";

type SendResult = { ok: true } | { ok: false; error: string };

let warnedResendNotConfigured = false;
let warnedEmailBaseMissing = false;

function warnResendNotConfigured(reason: string): void {
  if (warnedResendNotConfigured) {
    return;
  }
  warnedResendNotConfigured = true;
  console.warn(`[email] ${reason}`);
}

function warnEmailPublicBaseMissing(): void {
  if (warnedEmailBaseMissing) {
    return;
  }
  warnedEmailBaseMissing = true;
  console.warn(
    "[email] No NEXT_PUBLIC_APP_URL, APP_URL, or VERCEL_URL — transactional email links (verification, password reset) cannot be generated.",
  );
}

function resolveEmailPublicBase(): string | null {
  const pub = optionalEnvTrim("NEXT_PUBLIC_APP_URL");
  if (pub) {
    return pub.replace(/\/+$/, "");
  }
  const explicit = optionalEnvTrim("APP_URL");
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }
  const vercel = optionalEnvTrim("VERCEL_URL");
  if (vercel) {
    return `https://${vercel.replace(/^\/+/, "")}`;
  }
  return null;
}

export function buildPasswordResetUrl(rawToken: string): string | null {
  const base = resolveEmailPublicBase();
  if (!base) {
    warnEmailPublicBaseMissing();
    return null;
  }
  const url = new URL("/reset-password", base);
  url.searchParams.set("token", rawToken);
  return url.toString();
}

export function buildConfirmEmailUrl(rawToken: string): string | null {
  const base = resolveEmailPublicBase();
  if (!base) {
    warnEmailPublicBaseMissing();
    return null;
  }
  const url = new URL("/confirm-email", base);
  url.searchParams.set("token", rawToken);
  return url.toString();
}

function resendOutboundConfig(): {
  apiKey: string;
  from: string;
} | null {
  const apiKey = optionalEnvTrim("RESEND_API_KEY");
  const from = optionalEnvTrim("EMAIL_FROM");
  if (!apiKey || !from) {
    warnResendNotConfigured(
      "RESEND_API_KEY and/or EMAIL_FROM not set — password reset and signup verification emails are disabled.",
    );
    return null;
  }
  return { apiKey, from };
}

export async function sendPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
}): Promise<SendResult> {
  const cfg = resendOutboundConfig();
  if (!cfg) {
    return { ok: false, error: "Missing RESEND_API_KEY or EMAIL_FROM" };
  }

  const subject = "Reset your password";
  const text = `We received a request to reset your password.

Open this link (valid for 1 hour):
${input.resetUrl}

If you did not request this, you can ignore this email.`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: cfg.from,
        to: [input.to],
        subject,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return {
        ok: false,
        error: `Resend HTTP ${res.status}: ${body.slice(0, 200)}`,
      };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: msg };
  }
}

export async function sendEmailVerificationEmail(input: {
  to: string;
  confirmUrl: string;
}): Promise<SendResult> {
  const cfg = resendOutboundConfig();
  if (!cfg) {
    return { ok: false, error: "Missing RESEND_API_KEY or EMAIL_FROM" };
  }

  const subject = "Confirm your ResumeBlues account";
  const text = `Thanks for signing up for ResumeBlues.

Click the link below to confirm your email and activate your account.

${input.confirmUrl}

If you didn't create an account, you can ignore this email.`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: cfg.from,
        to: [input.to],
        subject,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return {
        ok: false,
        error: `Resend HTTP ${res.status}: ${body.slice(0, 200)}`,
      };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: msg };
  }
}
