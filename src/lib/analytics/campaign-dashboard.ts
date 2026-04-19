import type { AnalyticsEventType } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  prismaCreatedAtFilter,
  type ResolvedAnalyticsRange,
} from "@/lib/analytics/date-range";

/** List prices (USD) aligned with marketing copy; adjust if Stripe amounts change. */
const ONE_TIME_USD = 4.99;
const SUBSCRIPTION_USD = 9.99;

export type AdCampaignRow = {
  adId: string;
  users: number;
  purchases: number;
  revenueUsd: number;
};

function bucketAdId(v: string | null | undefined): string {
  return v && v.length > 0 ? v : "(none)";
}

export async function getAdCampaignRows(
  range: ResolvedAnalyticsRange,
): Promise<AdCampaignRow[]> {
  const userTime = prismaCreatedAtFilter(range);
  const userGroups = await prisma.user.groupBy({
    by: ["adId"],
    _count: { id: true },
    where: Object.keys(userTime).length > 0 ? userTime : undefined,
  });

  const purchaseTypes: AnalyticsEventType[] = [
    "PURCHASE_ONE_TIME_SUCCESS",
    "PURCHASE_SUBSCRIPTION_SUCCESS",
  ];

  const eventTime = prismaCreatedAtFilter(range);
  const events = await prisma.analyticsEvent.findMany({
    where: {
      type: { in: purchaseTypes },
      userId: { not: null },
      ...eventTime,
    },
    select: { userId: true, type: true },
  });

  const userIds = [...new Set(events.map((e) => e.userId!).filter(Boolean))];
  const buyers =
    userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, adId: true },
        })
      : [];

  const userIdToBucket = new Map(
    buyers.map((u) => [u.id, bucketAdId(u.adId)] as const),
  );

  const purchaseByBucket = new Map<string, { purchases: number; revenueUsd: number }>();
  for (const e of events) {
    const uid = e.userId!;
    const b = userIdToBucket.get(uid) ?? "(none)";
    const cur = purchaseByBucket.get(b) ?? { purchases: 0, revenueUsd: 0 };
    cur.purchases += 1;
    cur.revenueUsd +=
      e.type === "PURCHASE_ONE_TIME_SUCCESS" ? ONE_TIME_USD : SUBSCRIPTION_USD;
    purchaseByBucket.set(b, cur);
  }

  const keys = new Set<string>();
  for (const g of userGroups) {
    keys.add(bucketAdId(g.adId));
  }
  for (const k of purchaseByBucket.keys()) {
    keys.add(k);
  }

  const sorted = [...keys].sort((a, b) => {
    if (a === "(none)") {
      return 1;
    }
    if (b === "(none)") {
      return -1;
    }
    return a.localeCompare(b);
  });

  return sorted.map((adId) => {
    const ug = userGroups.find((g) => bucketAdId(g.adId) === adId);
    const users = ug?._count.id ?? 0;
    const p = purchaseByBucket.get(adId);
    return {
      adId,
      users,
      purchases: p?.purchases ?? 0,
      revenueUsd: p?.revenueUsd ?? 0,
    };
  });
}
