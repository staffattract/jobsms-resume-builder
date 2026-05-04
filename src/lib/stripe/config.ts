import { requireEnv } from "@/lib/env/server";

export function getStripeSecretKey(): string {
  return requireEnv("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret(): string {
  return requireEnv("STRIPE_WEBHOOK_SECRET");
}

export function getStripePriceOneTimePdf(): string {
  return requireEnv("STRIPE_PRICE_ONE_TIME_PDF");
}

export function getStripePriceMonthlySubscription(): string {
  return requireEnv("STRIPE_PRICE_MONTHLY_SUB");
}

/**
 * Upfront one-time Checkout line paired with subscription (e.g. trial starter charge).
 */
export function getStripePriceTrialOneTime(): string {
  return requireEnv("STRIPE_PRICE_TRIAL_ONE_TIME");
}

/** Public site URL for Checkout redirects (no trailing slash). */
export function getAppBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}
