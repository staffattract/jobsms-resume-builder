import type { PdfEntitlementTier } from "@/generated/prisma/client";

export type { PdfEntitlementTier };

/** Serializable snapshot for GET /api/me/entitlements and client gating. */
export type PdfEntitlementSnapshot = {
  tier: PdfEntitlementTier;
  canDownloadPdf: boolean;
  oneTimeDownloadsRemaining: number;
  subscriptionValidUntil: string | null;
  subscriptionActive: boolean;
};
