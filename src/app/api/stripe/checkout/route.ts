import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getAppBaseUrl,
  getStripePriceMonthlySubscription,
  getStripePriceOneTimePdf,
} from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function shortErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) {
    const m = err.message;
    return m.length > 400 ? `${m.slice(0, 400)}…` : m;
  }
  const s = String(err);
  return s.length > 400 ? `${s.slice(0, 400)}…` : s;
}

const bodySchema = z.object({
  kind: z.enum(["one_time", "subscription"]),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  let priceId: string;
  try {
    priceId =
      parsed.data.kind === "one_time"
        ? getStripePriceOneTimePdf()
        : getStripePriceMonthlySubscription();
  } catch {
    return NextResponse.json(
      { error: "Stripe billing is not configured on this server." },
      { status: 503 },
    );
  }

  const base = getAppBaseUrl();
  const stripe = getStripe();

  const sessionPayload =
    parsed.data.kind === "subscription"
      ? {
          mode: "subscription" as const,
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: `${base}/billing/checkout-return?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${base}/billing/checkout-return?canceled=1`,
          client_reference_id: user.id,
          metadata: { appUserId: user.id },
          subscription_data: { metadata: { appUserId: user.id } },
          customer: user.stripeCustomerId ?? undefined,
          customer_email: user.stripeCustomerId ? undefined : user.email ?? undefined,
          allow_promotion_codes: false,
        }
      : {
          mode: "payment" as const,
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: `${base}/billing/checkout-return?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${base}/billing/checkout-return?canceled=1`,
          client_reference_id: user.id,
          metadata: { appUserId: user.id },
          customer: user.stripeCustomerId ?? undefined,
          customer_email: user.stripeCustomerId ? undefined : user.email ?? undefined,
          allow_promotion_codes: false,
        };

  try {
    const session = await stripe.checkout.sessions.create(sessionPayload);

    if (!session.url) {
      return NextResponse.json(
        { error: "Checkout session did not return a URL." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe] checkout failed:", shortErrorMessage(err));
    return NextResponse.json(
      { error: "Unable to start checkout session." },
      { status: 502 },
    );
  }
}
