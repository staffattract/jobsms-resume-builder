import type { AnalyticsEventType } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export async function recordAnalyticsEvent(input: {
  type: AnalyticsEventType;
  userId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        type: input.type,
        userId: input.userId ?? undefined,
        metadata: (input.metadata ?? {}) as object,
      },
    });
  } catch (err) {
    console.error("[analytics] record failed", input.type, err);
  }
}
