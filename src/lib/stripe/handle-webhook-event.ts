import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe/client";
import { applyCheckoutSessionCompleted } from "@/lib/stripe/process-checkout-session";
import { getSubscriptionIdFromInvoice } from "@/lib/stripe/invoice-subscription";
import {
  revokeSubscriptionEntitlement,
  syncSubscriptionEntitlementFromStripe,
} from "@/lib/stripe/subscription-sync";

export async function handleStripeWebhookEvent(
  event: Stripe.Event,
): Promise<void> {
  const stripe = getStripe();

  switch (event.type) {
    case "customer.subscription.created": {
      const partial = event.data.object as Stripe.Subscription;
      const sub = await stripe.subscriptions.retrieve(partial.id, {
        expand: ["items.data.price"],
      });
      await syncSubscriptionEntitlementFromStripe(sub);
      return;
    }
    case "checkout.session.completed": {
      try {
        await prisma.processedStripeEvent.create({
          data: { stripeEventId: event.id },
        });
      } catch {
        return;
      }
      try {
        await applyCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
      } catch (err) {
        await prisma.processedStripeEvent.deleteMany({
          where: { stripeEventId: event.id },
        });
        throw err;
      }
      return;
    }
    case "customer.subscription.updated": {
      const partial = event.data.object as Stripe.Subscription;
      const sub = await stripe.subscriptions.retrieve(partial.id, {
        expand: ["items.data"],
      });
      await syncSubscriptionEntitlementFromStripe(sub);
      return;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await revokeSubscriptionEntitlement(sub);
      return;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = getSubscriptionIdFromInvoice(invoice);
      if (!subId) {
        return;
      }
      const sub = await stripe.subscriptions.retrieve(subId, {
        expand: ["items.data"],
      });
      await syncSubscriptionEntitlementFromStripe(sub);
      return;
    }
    default:
      return;
  }
}
