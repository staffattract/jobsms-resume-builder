import type Stripe from "stripe";

/** Subscription id for subscription-cycle invoices (Stripe `Invoice.parent` shape). */
export function getSubscriptionIdFromInvoice(
  invoice: Stripe.Invoice,
): string | null {
  const parent = invoice.parent;
  if (!parent || parent.type !== "subscription_details") {
    return null;
  }
  const details = parent.subscription_details;
  if (!details) {
    return null;
  }
  const sub = details.subscription;
  if (!sub) {
    return null;
  }
  return typeof sub === "string" ? sub : sub.id;
}
