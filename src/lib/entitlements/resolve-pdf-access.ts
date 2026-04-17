import type { PdfEntitlementTier } from "@/generated/prisma/client";
import type { PdfEntitlementSnapshot } from "@/lib/entitlements/types";

export type PdfEntitlementFields = {
  pdfEntitlementTier: PdfEntitlementTier;
  pdfOneTimeDownloadsRemaining: number;
  subscriptionValidUntil: Date | null;
};

function subscriptionIsActive(
  subscriptionValidUntil: Date | null,
  now: Date,
): boolean {
  return !!subscriptionValidUntil && subscriptionValidUntil > now;
}

/** Pure policy: free = no PDF; one-time = while credits remain; subscription = while period valid. */
export function canUserDownloadPdf(
  row: PdfEntitlementFields,
  now: Date = new Date(),
): boolean {
  switch (row.pdfEntitlementTier) {
    case "FREE":
      return false;
    case "ONE_TIME":
      return row.pdfOneTimeDownloadsRemaining > 0;
    case "SUBSCRIPTION":
      return subscriptionIsActive(row.subscriptionValidUntil, now);
    default:
      return false;
  }
}

export function toPdfEntitlementSnapshot(
  row: PdfEntitlementFields,
  now: Date = new Date(),
): PdfEntitlementSnapshot {
  const subscriptionActive = subscriptionIsActive(
    row.subscriptionValidUntil,
    now,
  );
  return {
    tier: row.pdfEntitlementTier,
    canDownloadPdf: canUserDownloadPdf(row, now),
    oneTimeDownloadsRemaining: row.pdfOneTimeDownloadsRemaining,
    subscriptionValidUntil: row.subscriptionValidUntil
      ? row.subscriptionValidUntil.toISOString()
      : null,
    subscriptionActive,
  };
}
