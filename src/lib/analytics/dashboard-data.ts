import type { AnalyticsEventType } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  prismaCreatedAtFilter,
  type ResolvedAnalyticsRange,
} from "@/lib/analytics/date-range";

const ALL_TYPES = [
  "PAGE_VIEW_HOME",
  "START_BUILDING_CLICK",
  "SEE_PRICING_CLICK",
  "DOWNLOAD_PDF_CLICK",
  "REGISTRATION_CREATED",
  "EMAIL_CONFIRMATION_CLICKED",
  "PURCHASE_ONE_TIME_SUCCESS",
  "PURCHASE_SUBSCRIPTION_SUCCESS",
] as const satisfies readonly AnalyticsEventType[];

export type AnalyticsCounts = Record<(typeof ALL_TYPES)[number], number>;

export async function getAnalyticsCounts(
  range: ResolvedAnalyticsRange,
): Promise<AnalyticsCounts> {
  const timeFilter = prismaCreatedAtFilter(range);
  const pairs = await Promise.all(
    ALL_TYPES.map(
      async (type) =>
        [
          type,
          await prisma.analyticsEvent.count({
            where: { type, ...timeFilter },
          }),
        ] as const,
    ),
  );
  return Object.fromEntries(pairs) as AnalyticsCounts;
}
