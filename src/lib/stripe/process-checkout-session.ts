import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import {
  getStripePriceMonthlySubscription,
  getStripePriceOneTimePdf,
} from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/client";
import { stripeCustomerIdFromSessionLike } from "@/lib/stripe/customer-id";
import { getSubscriptionPeriodEnd } from "@/lib/stripe/subscription-period";

function firstLineItemPriceId(session: Stripe.Checkout.Session): string | null {
  const items = session.line_items;
  if (!items || typeof items === "string" || !("data" in items)) {
    return null;
  }
  const first = items.data[0];
  const price = first?.price;
  if (!price) {
    return null;
  }
  return typeof price === "string" ? price : price.id;
}

/**
 * Applies a completed Checkout session to PDF entitlements (after Stripe payment succeeds).
 * Idempotent for duplicate webhook delivery via `ProcessedStripeEvent` (caller).
 */
export async function applyCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (session.payment_status !== "paid") {
    return;
  }
  const userId =
    session.client_reference_id?.trim() ||
    session.metadata?.appUserId?.trim() ||
    null;
  if (!userId) {
    return;
  }

  const stripe = getStripe();
  const full = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items", "subscription.items.data"],
  });

  const customerId = stripeCustomerIdFromSessionLike(full.customer);
  const priceId = firstLineItemPriceId(full);
  const oneTimePrice = getStripePriceOneTimePdf();
  const subPrice = getStripePriceMonthlySubscription();

  if (full.mode === "payment" && priceId === oneTimePrice) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(customerId ? { stripeCustomerId: customerId } : {}),
        pdfEntitlementTier: "ONE_TIME",
        pdfOneTimeDownloadsRemaining: { increment: 1 },
      },
    });
    return;
  }

  if (full.mode === "subscription" && priceId === subPrice) {
    const subRaw = full.subscription;
    if (!subRaw || typeof subRaw === "string") {
      return;
    }
    const sub = subRaw as Stripe.Subscription;
    const periodEnd = getSubscriptionPeriodEnd(sub);
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(customerId ? { stripeCustomerId: customerId } : {}),
        stripeSubscriptionId: sub.id,
        pdfEntitlementTier: "SUBSCRIPTION",
        subscriptionValidUntil: periodEnd,
      },
    });
  }
}
