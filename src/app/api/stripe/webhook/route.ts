import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeWebhookSecret } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/client";
import { handleStripeWebhookEvent } from "@/lib/stripe/handle-webhook-event";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let webhookSecret: string;
  try {
    webhookSecret = getStripeWebhookSecret();
  } catch {
    console.error(
      "[stripe-webhook] STRIPE_WEBHOOK_SECRET is missing — webhook handler is disabled.",
    );
    return NextResponse.json(
      {
        error: "Stripe webhook signing secret is not configured.",
        code: "STRIPE_WEBHOOK_UNCONFIGURED",
      },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  console.log("[stripe-webhook] diagnostics", {
    hasWebhookSecret: true,
    signatureHeaderPresent: Boolean(signature),
    runtime: "nodejs",
    rawBodyLength: rawBody.length,
  });

  if (!signature) {
    console.log("[stripe-webhook] signature_verified=false (missing header)");
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
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
