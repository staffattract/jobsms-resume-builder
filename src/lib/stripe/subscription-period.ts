import type Stripe from "stripe";

/**
 * End of the current paid-through window for this subscription.
 * Stripe exposes this on subscription items in current API versions.
 */
export function getSubscriptionPeriodEnd(sub: Stripe.Subscription): Date {
  const first = sub.items?.data?.[0];
  if (first?.current_period_end) {
    return new Date(first.current_period_end * 1000);
  }
  const legacy = sub as Stripe.Subscription & { current_period_end?: number };
  if (typeof legacy.current_period_end === "number") {
    return new Date(legacy.current_period_end * 1000);
  }
  throw new Error("Cannot resolve subscription period end from Stripe payload");
}
