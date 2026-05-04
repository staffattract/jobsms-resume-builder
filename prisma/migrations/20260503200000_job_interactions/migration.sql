-- CreateEnum
CREATE TYPE "JobInteractionStatus" AS ENUM ('NONE', 'SAVED', 'APPLIED', 'IGNORED');

-- CreateTable
CREATE TABLE "JobInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "externalJobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "location" TEXT,
    "jobUrl" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "searchedLocation" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'employment_alert',
    "status" "JobInteractionStatus" NOT NULL DEFAULT 'NONE',
    "clickedAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobInteraction_userId_externalJobId_key" ON "JobInteraction"("userId", "externalJobId");

-- CreateIndex
CREATE INDEX "JobInteraction_userId_status_idx" ON "JobInteraction"("userId", "status");

-- AddForeignKey
ALTER TABLE "JobInteraction" ADD CONSTRAINT "JobInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
