import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { getStripeWebhookSecret } from "@/lib/stripe/config";
import { handleStripeWebhookEvent } from "@/lib/stripe/handle-webhook-event";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    console.log("[stripe-webhook] signature_verified=false (missing header)");
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      sig,
      getStripeWebhookSecret(),
    );
  } catch {
    console.log("[stripe-webhook] signature_verified=false");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("[stripe-webhook] signature_verified=true", {
    eventType: event.type,
  });

  try {
    await handleStripeWebhookEvent(event);
  } catch {
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
