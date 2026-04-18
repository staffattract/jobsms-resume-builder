import { NextResponse } from "next/server";
import { isClientAnalyticsEventType } from "@/lib/analytics/constants";
import { recordAnalyticsEvent } from "@/lib/analytics/record-event";
import type { AnalyticsEventType } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const type =
    typeof body === "object" &&
    body !== null &&
    "type" in body &&
    typeof (body as { type: unknown }).type === "string"
      ? (body as { type: string }).type
      : null;
  if (!type || !isClientAnalyticsEventType(type)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  const user = await getCurrentUser();
  await recordAnalyticsEvent({
    type: type as AnalyticsEventType,
    userId: user?.id ?? null,
  });
  return NextResponse.json({ ok: true });
}
