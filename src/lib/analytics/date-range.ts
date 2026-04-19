export type ResolvedAnalyticsRange =
  | { mode: "all" }
  | { mode: "rolling"; start: Date; end: Date; days: 7 | 30 | 90 }
  | { mode: "custom"; start: Date; end: Date };

export type AnalyticsRangeQuery = {
  preset?: string;
  from?: string;
  to?: string;
};

function rollingEnd(): Date {
  return new Date();
}

function rollingStart(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function parseYmdUtcBounds(
  from: string,
  to: string,
): { start: Date; end: Date } | null {
  const a = from.trim();
  const b = to.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a) || !/^\d{4}-\d{2}-\d{2}$/.test(b)) {
    return null;
  }
  const [y1, m1, d1] = a.split("-").map(Number);
  const [y2, m2, d2] = b.split("-").map(Number);
  const start = new Date(Date.UTC(y1, m1 - 1, d1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(y2, m2 - 1, d2, 23, 59, 59, 999));
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start.getTime() > end.getTime()
  ) {
    return null;
  }
  return { start, end };
}

/**
 * Resolves admin dashboard analytics range from URL search params.
 * Default: last 30 days (rolling). Invalid custom falls back to 30d.
 */
export function resolveAnalyticsRange(
  q: AnalyticsRangeQuery,
): ResolvedAnalyticsRange {
  const fromRaw = q.from?.trim();
  const toRaw = q.to?.trim();
  if (fromRaw && toRaw) {
    const bounds = parseYmdUtcBounds(fromRaw, toRaw);
    if (bounds) {
      return { mode: "custom", start: bounds.start, end: bounds.end };
    }
  }

  const preset = q.preset?.trim().toLowerCase();
  if (preset === "all") {
    return { mode: "all" };
  }
  if (preset === "7d" || preset === "7") {
    return { mode: "rolling", start: rollingStart(7), end: rollingEnd(), days: 7 };
  }
  if (preset === "90d" || preset === "90") {
    return { mode: "rolling", start: rollingStart(90), end: rollingEnd(), days: 90 };
  }
  if (preset === "30d" || preset === "30") {
    return { mode: "rolling", start: rollingStart(30), end: rollingEnd(), days: 30 };
  }

  return { mode: "rolling", start: rollingStart(30), end: rollingEnd(), days: 30 };
}

export function prismaCreatedAtFilter(
  range: ResolvedAnalyticsRange,
): { createdAt: { gte: Date; lte: Date } } | Record<string, never> {
  if (range.mode === "all") {
    return {};
  }
  return { createdAt: { gte: range.start, lte: range.end } };
}

export type AnalyticsFilterTab = "7d" | "30d" | "90d" | "all" | "custom";

export function filterTabFromResolved(
  resolved: ResolvedAnalyticsRange,
): AnalyticsFilterTab {
  if (resolved.mode === "custom") {
    return "custom";
  }
  if (resolved.mode === "all") {
    return "all";
  }
  if (resolved.days === 7) {
    return "7d";
  }
  if (resolved.days === 90) {
    return "90d";
  }
  return "30d";
}
