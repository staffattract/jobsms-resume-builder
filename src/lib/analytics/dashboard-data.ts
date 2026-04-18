import type { AnalyticsEventType } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

const ALL_TYPES = [
  "PAGE_VIEW_HOME",
  "START_BUILDING_CLICK",
  "SEE_PRICING_CLICK",
  "DOWNLOAD_PDF_CLICK",
  "PURCHASE_ONE_TIME_SUCCESS",
  "PURCHASE_SUBSCRIPTION_SUCCESS",
] as const satisfies readonly AnalyticsEventType[];

export type AnalyticsCounts = Record<(typeof ALL_TYPES)[number], number>;

export async function getAnalyticsCounts(): Promise<AnalyticsCounts> {
  const pairs = await Promise.all(
    ALL_TYPES.map(
      async (type) =>
        [type, await prisma.analyticsEvent.count({ where: { type } })] as const,
    ),
  );
  return Object.fromEntries(pairs) as AnalyticsCounts;
}
