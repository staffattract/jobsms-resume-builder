"use client";

import type { ClientAnalyticsEventType } from "@/lib/analytics/constants";

/** Fire-and-forget; uses keepalive so events often complete before navigation. */
export function trackClientAnalyticsEvent(type: ClientAnalyticsEventType): void {
  void fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ type }),
    keepalive: true,
  }).catch(() => {});
}
