import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { getAppBaseUrl } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = await prisma.user.findFirst({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });

  if (!row?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe billing account on file yet." },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: row.stripeCustomerId,
      return_url: `${getAppBaseUrl()}/account`,
    });
    if (!session.url) {
      return NextResponse.json(
        { error: "Billing portal did not return a URL." },
        { status: 500 },
      );
    }
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(
      "[stripe] billing portal:",
      e instanceof Error ? e.message.slice(0, 200) : String(e),
    );
    return NextResponse.json(
      { error: "Unable to open billing portal. Check Stripe Dashboard configuration." },
      { status: 502 },
    );
  }
}
