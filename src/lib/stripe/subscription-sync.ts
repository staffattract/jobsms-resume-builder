import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getStripePriceMonthlySubscription } from "@/lib/stripe/config";
import { stripeCustomerIdFromSessionLike } from "@/lib/stripe/customer-id";
import { getSubscriptionPeriodEnd } from "@/lib/stripe/subscription-period";

/**
 * Find app user for a Stripe subscription (customer link, stored sub id, or metadata).
 */
export async function findUserForStripeSubscription(
  sub: Stripe.Subscription,
): Promise<{ id: string } | null> {
  const bySubId = await prisma.user.findFirst({
    where: { stripeSubscriptionId: sub.id },
    select: { id: true },
  });
  if (bySubId) {
    return bySubId;
  }
  const customerId = stripeCustomerIdFromSessionLike(sub.customer);
  if (customerId) {
    const byCustomer = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
      select: { id: true },
    });
    if (byCustomer) {
      return byCustomer;
    }
  }
  const metaUserId = sub.metadata?.appUserId;
  if (metaUserId) {
    return prisma.user.findUnique({
      where: { id: metaUserId },
      select: { id: true },
    });
  }
  return null;
}

/**
 * Maps Stripe subscription state to DB entitlement fields (policy layer unchanged).
 * Access is allowed through `subscriptionValidUntil` while that timestamp is in the future.
 */
export async function syncSubscriptionEntitlementFromStripe(
  sub: Stripe.Subscription,
): Promise<void> {
  if (sub.status === "incomplete" || sub.status === "incomplete_expired") {
    return;
  }
  const user = await findUserForStripeSubscription(sub);
  if (!user) {
    return;
  }

  let monthlyPriceId: string | undefined;
  try {
    monthlyPriceId = getStripePriceMonthlySubscription();
  } catch {
    monthlyPriceId = undefined;
  }
  const periodEnd = getSubscriptionPeriodEnd(sub, monthlyPriceId);
  const now = new Date();
  const status = sub.status;
  const hasPaidThroughFuture =
    periodEnd > now &&
    (status === "active" ||
      status === "trialing" ||
      status === "past_due" ||
      status === "canceled" ||
      status === "paused");

  const customerId = stripeCustomerIdFromSessionLike(sub.customer);

  if (hasPaidThroughFuture) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        pdfEntitlementTier: "SUBSCRIPTION",
        subscriptionValidUntil: periodEnd,
        stripeSubscriptionId: sub.id,
        ...(customerId ? { stripeCustomerId: customerId } : {}),
      },
    });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      pdfEntitlementTier: "FREE",
      subscriptionValidUntil: null,
      stripeSubscriptionId: null,
    },
  });
}

export async function revokeSubscriptionEntitlement(
  sub: Stripe.Subscription,
): Promise<void> {
  const user = await findUserForStripeSubscription(sub);
  if (!user) {
    return;
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      pdfEntitlementTier: "FREE",
      subscriptionValidUntil: null,
      stripeSubscriptionId: null,
    },
  });
}
