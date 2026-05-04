import type Stripe from "stripe";

/**
 * End of the current paid-through window for this subscription item(s).
 *
 * When `preferredRecurringPriceId` is set, picks that item's `current_period_end` (recommended
 * for multi-item subscriptions with a distinct recurring tier). Otherwise uses the greatest
 * `current_period_end` across items (or legacy subscription-level field).
 */
export function getSubscriptionPeriodEnd(
  sub: Stripe.Subscription,
  preferredRecurringPriceId?: string,
): Date {
  const items = sub.items?.data ?? [];
  if (preferredRecurringPriceId) {
    for (const row of items) {
      const priceRef = row.price;
      const id = typeof priceRef === "string" ? priceRef : priceRef?.id;
      if (id !== preferredRecurringPriceId) {
        continue;
      }
      const endSec = row.current_period_end as number | undefined;
      if (typeof endSec === "number" && endSec > 0) {
        return new Date(endSec * 1000);
      }
    }
  }

  let best = 0;
  for (const row of items) {
    const endSec = row.current_period_end as number | undefined;
    if (typeof endSec === "number" && endSec > best) {
      best = endSec;
    }
  }
  if (best > 0) {
    return new Date(best * 1000);
  }

  const legacy = sub as Stripe.Subscription & { current_period_end?: number };
  if (
    typeof legacy.current_period_end === "number" &&
    legacy.current_period_end > 0
  ) {
    return new Date(legacy.current_period_end * 1000);
  }

  throw new Error("Cannot resolve subscription period end from Stripe payload");
}
