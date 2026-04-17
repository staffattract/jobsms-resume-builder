import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Temporary dev-only: grant ONE_TIME PDF entitlement with 1 download remaining.
 * Remove when PDF billing flow is stable in all environments.
 */
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      pdfEntitlementTier: "ONE_TIME",
      pdfOneTimeDownloadsRemaining: 1,
    },
    select: {
      pdfEntitlementTier: true,
      pdfOneTimeDownloadsRemaining: true,
    },
  });

  return NextResponse.json({
    ok: true,
    pdfEntitlementTier: updated.pdfEntitlementTier,
    pdfOneTimeDownloadsRemaining: updated.pdfOneTimeDownloadsRemaining,
  });
}
