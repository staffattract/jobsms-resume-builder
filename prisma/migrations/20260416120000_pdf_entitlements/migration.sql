-- CreateEnum
CREATE TYPE "PdfEntitlementTier" AS ENUM ('FREE', 'ONE_TIME', 'SUBSCRIPTION');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pdfEntitlementTier" "PdfEntitlementTier" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "pdfOneTimeDownloadsRemaining" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subscriptionValidUntil" TIMESTAMP(3);
