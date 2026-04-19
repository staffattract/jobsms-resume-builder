import { NextResponse } from "next/server";
import { requireVerifiedSessionUser } from "@/lib/auth/api-auth";
import { getPdfEntitlementSnapshotForUser } from "@/lib/entitlements/entitlement-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireVerifiedSessionUser();
  if (user instanceof NextResponse) {
    return user;
  }
  const snapshot = await getPdfEntitlementSnapshotForUser(user.id);
  if (!snapshot) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(snapshot);
}
