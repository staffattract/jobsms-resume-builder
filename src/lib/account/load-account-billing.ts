import type Stripe from "stripe";
import type { PdfEntitlementTier } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { toPdfEntitlementSnapshot } from "@/lib/entitlements/resolve-pdf-access";
import {
  getStripePriceMonthlySubscription,
  getStripePriceOneTimePdf,
} from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/client";
import { getSubscriptionPeriodEnd } from "@/lib/stripe/subscription-period";

export type AccountPaymentRow = {
  id: string;
  date: Date;
  amountLabel: string;
  typeLabel: string;
  status: string | null;
};

export type AccountSubscriptionDetails = {
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
};

export type AccountBillingPageData = {
  email: string;
  createdAt: Date;
  tier: PdfEntitlementTier;
  oneTimeDownloadsRemaining: number;
  subscriptionValidUntil: Date | null;
  subscriptionActive: boolean;
  planSummary: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  payments: AccountPaymentRow[];
  paymentsLoadError: string | null;
  subscriptionDetails: AccountSubscriptionDetails | null;
};

function priceIdsOrNull(): { oneTime: string; sub: string } | null {
  try {
    return {
      oneTime: getStripePriceOneTimePdf(),
      sub: getStripePriceMonthlySubscription(),
    };
  } catch {
    return null;
  }
}

/** Catalog price id from an invoice line (Basil+ API: `pricing.price_details.price`, not `line.price`). */
function firstLinePriceId(line: Stripe.InvoiceLineItem): string | null {
  const pricing = line.pricing;
  if (!pricing || pricing.type !== "price_details") {
    return null;
  }
  const raw = pricing.price_details?.price;
  if (!raw) return null;
  return typeof raw === "string" ? raw : raw.id;
}

function typeLabelForInvoice(
  invoice: Stripe.Invoice,
  prices: { oneTime: string; sub: string } | null,
): string {
  const reason = invoice.billing_reason;
  if (reason && String(reason).startsWith("subscription")) {
    return "Subscription";
  }

  const parent = invoice.parent;
  if (
    parent?.type === "subscription_details" &&
    parent.subscription_details?.subscription
  ) {
    return "Subscription";
  }

  const lines = invoice.lines?.data ?? [];
  for (const line of lines) {
    if (line.subscription) {
      return "Subscription";
    }
    const pid = firstLinePriceId(line);
    if (!pid || !prices) continue;
    if (pid === prices.oneTime) return "PDF purchase";
    if (pid === prices.sub) return "Subscription";
  }

  return "Payment";
}

function formatMoney(cents: number, currency: string | null): string {
  const cur = (currency ?? "usd").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cur,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${cur}`;
  }
}

function planSummaryFromTier(
  tier: PdfEntitlementTier,
  remaining: number,
  subActive: boolean,
  subUntil: Date | null,
): string {
  switch (tier) {
    case "FREE":
      return "Free — PDF export requires an active subscription (start with $1 at checkout).";
    case "ONE_TIME":
      return `PDF purchase — ${remaining} download${remaining === 1 ? "" : "s"} remaining.`;
    case "SUBSCRIPTION":
      if (subActive && subUntil) {
        return `Subscription — active through ${subUntil.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}.`;
      }
      return "Subscription — not currently active.";
    default:
      return String(tier);
  }
}

/** Loads the signed-in user’s account + Stripe invoice history (Stripe API, never another user). */
export async function loadAccountBillingForUser(
  userId: string,
): Promise<AccountBillingPageData | null> {
  const user = await prisma.user.findFirst({
    where: { id: userId },
    select: {
      email: true,
      createdAt: true,
      pdfEntitlementTier: true,
      pdfOneTimeDownloadsRemaining: true,
      subscriptionValidUntil: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });
  if (!user) return null;

  const snap = toPdfEntitlementSnapshot({
    pdfEntitlementTier: user.pdfEntitlementTier,
    pdfOneTimeDownloadsRemaining: user.pdfOneTimeDownloadsRemaining,
    subscriptionValidUntil: user.subscriptionValidUntil,
  });

  const planSummary = planSummaryFromTier(
    user.pdfEntitlementTier,
    user.pdfOneTimeDownloadsRemaining,
    snap.subscriptionActive,
    user.subscriptionValidUntil,
  );

  let payments: AccountPaymentRow[] = [];
  let paymentsLoadError: string | null = null;
  let subscriptionDetails: AccountSubscriptionDetails | null = null;

  const prices = priceIdsOrNull();

  try {
    const stripe = getStripe();

    if (user.stripeSubscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        subscriptionDetails = {
          status: sub.status,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          currentPeriodEnd: new Date(
            getSubscriptionPeriodEnd(sub, prices?.sub),
          ),
        };
      } catch {
        subscriptionDetails = null;
      }
    }

    if (user.stripeCustomerId) {
      const invoices = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: 24,
      });

      payments = invoices.data
        .filter((inv) => inv.status === "paid")
        .map((inv) => {
          const paidAt =
            inv.status_transitions?.paid_at ?? inv.created ?? Math.floor(Date.now() / 1000);
          return {
            id: inv.id ?? String(inv.number ?? "unknown"),
            date: new Date(paidAt * 1000),
            amountLabel: formatMoney(
              inv.amount_paid > 0 ? inv.amount_paid : inv.total,
              inv.currency,
            ),
            typeLabel: typeLabelForInvoice(inv, prices),
            status: inv.status,
          };
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    }
  } catch (e) {
    paymentsLoadError =
      e instanceof Error ? e.message.slice(0, 120) : "Unable to load billing data.";
  }

  return {
    email: user.email,
    createdAt: user.createdAt,
    tier: user.pdfEntitlementTier,
    oneTimeDownloadsRemaining: user.pdfOneTimeDownloadsRemaining,
    subscriptionValidUntil: user.subscriptionValidUntil,
    subscriptionActive: snap.subscriptionActive,
    planSummary,
    stripeCustomerId: user.stripeCustomerId,
    stripeSubscriptionId: user.stripeSubscriptionId,
    payments,
    paymentsLoadError,
    subscriptionDetails,
  };
}
