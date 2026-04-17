import type { PdfEntitlementSnapshot } from "@/lib/entitlements/types";
import { prisma } from "@/lib/db";
import { toPdfEntitlementSnapshot } from "@/lib/entitlements/resolve-pdf-access";

const entitlementSelect = {
  pdfEntitlementTier: true,
  pdfOneTimeDownloadsRemaining: true,
  subscriptionValidUntil: true,
} as const;

/** Reads PDF entitlement from the database (updated by Stripe webhooks after payment). */
export async function getPdfEntitlementSnapshotForUser(
  userId: string,
): Promise<PdfEntitlementSnapshot | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: entitlementSelect,
  });
  if (!user) {
    return null;
  }
  return toPdfEntitlementSnapshot(user);
}

/**
 * After a successful PDF generation, consume one-time credit if applicable.
 * Idempotent for FREE/SUBSCRIPTION; atomic decrement for ONE_TIME.
 */
export async function consumePdfEntitlementAfterSuccessfulDownload(
  userId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        pdfEntitlementTier: true,
        pdfOneTimeDownloadsRemaining: true,
      },
    });
    if (
      user?.pdfEntitlementTier === "ONE_TIME" &&
      user.pdfOneTimeDownloadsRemaining > 0
    ) {
      await tx.user.updateMany({
        where: {
          id: userId,
          pdfEntitlementTier: "ONE_TIME",
          pdfOneTimeDownloadsRemaining: { gt: 0 },
        },
        data: {
          pdfOneTimeDownloadsRemaining: { decrement: 1 },
        },
      });
    }
  });
}
