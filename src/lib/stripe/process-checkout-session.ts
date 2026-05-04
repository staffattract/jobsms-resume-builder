import Stripe from "stripe";
import { recordAnalyticsEvent } from "@/lib/analytics/record-event";
import { prisma } from "@/lib/db";
import {
  getStripePriceMonthlySubscription,
  getStripePriceOneTimePdf,
} from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/client";
import { stripeCustomerIdFromSessionLike } from "@/lib/stripe/customer-id";
import { getSubscriptionPeriodEnd } from "@/lib/stripe/subscription-period";

/** True if Checkout line items include a given price id (any position). */
function checkoutLineItemsIncludePriceId(
  session: Stripe.Checkout.Session,
  priceId: string,
): boolean {
  const items = session.line_items;
  if (!items || typeof items === "string" || !("data" in items)) {
    return false;
  }
  for (const li of items.data) {
    const priceRef = li.price;
    const id = typeof priceRef === "string" ? priceRef : priceRef?.id;
    if (id === priceId) {
      return true;
    }
  }
  return false;
}

function subscriptionItemsIncludePriceId(
  sub: Stripe.Subscription,
  priceId: string,
): boolean {
  for (const row of sub.items.data) {
    const priceRef = row.price;
    const id = typeof priceRef === "string" ? priceRef : priceRef?.id;
    if (id === priceId) {
      return true;
    }
  }
  return false;
}

async function loadSubscriptionFromCheckoutSession(
  stripeApi: Stripe,
  session: Stripe.Checkout.Session,
): Promise<Stripe.Subscription | null> {
  const ref = session.subscription;
  if (!ref) {
    return null;
  }
  const id = typeof ref === "string" ? ref : ref.id;
  return stripeApi.subscriptions.retrieve(id, {
    expand: ["items.data.price"],
  });
}

function resolveCheckoutUserId(
  session: Stripe.Checkout.Session,
  subscription: Stripe.Subscription | null,
): string | null {
  const fromSession =
    session.client_reference_id?.trim() ||
    session.metadata?.appUserId?.trim() ||
    "";
  if (fromSession) {
    return fromSession;
  }
  const fromSub = subscription?.metadata?.appUserId?.trim();
  return fromSub || null;
}

/**
 * Applies a completed Checkout session to PDF entitlements (after Stripe payment succeeds).
 * Idempotent for duplicate webhook delivery via `ProcessedStripeEvent` (caller).
 *
 * - `mode === "payment"`: one-time PDF credits when line items include the one-time PDF price.
 * - `mode === "subscription"`: grants subscription tier using the Stripe Subscription attached to
 *   the session, verifying it includes the configured monthly recurring price (order of Checkout
 *   line items is not used).
 */
export async function applyCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (session.payment_status !== "paid") {
    return;
  }

  const stripeApi = getStripe();
  const full = await stripeApi.checkout.sessions.retrieve(session.id, {
    expand: ["line_items"],
  });

  const customerId = stripeCustomerIdFromSessionLike(full.customer);

  const oneTimePrice = getStripePriceOneTimePdf();
  const monthlyPriceId = getStripePriceMonthlySubscription();

  if (full.mode === "payment") {
    const userId = resolveCheckoutUserId(full, null);
    if (!userId) {
      return;
    }
    if (!checkoutLineItemsIncludePriceId(full, oneTimePrice)) {
      return;
    }
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(customerId ? { stripeCustomerId: customerId } : {}),
        pdfEntitlementTier: "ONE_TIME",
        pdfOneTimeDownloadsRemaining: { increment: 1 },
      },
    });
    await recordAnalyticsEvent({
      type: "PURCHASE_ONE_TIME_SUCCESS",
      userId,
    });
    return;
  }

  if (full.mode === "subscription") {
    const subscription = await loadSubscriptionFromCheckoutSession(
      stripeApi,
      full,
    );
    const userId = resolveCheckoutUserId(full, subscription);
    if (!userId) {
      return;
    }
    if (!subscription) {
      return;
    }
    if (!subscriptionItemsIncludePriceId(subscription, monthlyPriceId)) {
      return;
    }

    const periodEnd = getSubscriptionPeriodEnd(subscription, monthlyPriceId);

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(customerId ? { stripeCustomerId: customerId } : {}),
        stripeSubscriptionId: subscription.id,
        pdfEntitlementTier: "SUBSCRIPTION",
        subscriptionValidUntil: periodEnd,
      },
    });
    await recordAnalyticsEvent({
      type: "PURCHASE_SUBSCRIPTION_SUCCESS",
      userId,
    });
  }
}
