/**
 * Transactional email via [Resend](https://resend.com) HTTP API (no extra npm package).
 */

type SendResult = { ok: true } | { ok: false; error: string };

function getAppBaseUrl(): string | null {
  const pub = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (pub) {
    return pub.replace(/\/+$/, "");
  }
  const explicit = process.env.APP_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/^\/+/, "")}`;
  }
  return null;
}

export function buildPasswordResetUrl(rawToken: string): string | null {
  const base = getAppBaseUrl();
  if (!base) {
    return null;
  }
  const url = new URL("/reset-password", base);
  url.searchParams.set("token", rawToken);
  return url.toString();
}

export async function sendPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) {
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
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
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
