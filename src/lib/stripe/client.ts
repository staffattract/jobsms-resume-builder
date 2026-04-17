import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/stripe/config";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    stripe = new Stripe(getStripeSecretKey(), {
      typescript: true,
    });
  }
  return stripe;
}
