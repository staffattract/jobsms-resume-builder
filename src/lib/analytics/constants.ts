/** Event types allowed from the browser (public POST). Purchase events are server-only. */
export const CLIENT_ANALYTICS_EVENT_TYPES = [
  "START_BUILDING_CLICK",
  "SEE_PRICING_CLICK",
  "DOWNLOAD_PDF_CLICK",
] as const;

export type ClientAnalyticsEventType =
  (typeof CLIENT_ANALYTICS_EVENT_TYPES)[number];

export const CLIENT_ANALYTICS_EVENT_TYPE_SET = new Set<string>(
  CLIENT_ANALYTICS_EVENT_TYPES,
);

export function isClientAnalyticsEventType(
  value: string,
): value is ClientAnalyticsEventType {
  return CLIENT_ANALYTICS_EVENT_TYPE_SET.has(value);
}
