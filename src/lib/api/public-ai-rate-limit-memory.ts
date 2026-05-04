/**
 * Lightweight per-instance sliding-window rate limiting for guest AI routes.
 *
 * Across multiple server instances (horizontal scale), limits are enforced per replica.
 */

const STORE = new Map<string, number[]>();
const MAX_KEYS = 20_000;

export function extractRequestClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.trim();
  if (forwarded) {
    const first = forwarded.split(",").shift()?.trim();
    if (first) return first.slice(0, 128);
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 128);
  return "unknown";
}

export function slidingWindowConsume(
  key: string,
  maxHits: number,
  windowMs: number,
): {
  ok: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const cutoff = now - windowMs;
  let hits = STORE.get(key) ?? [];
  hits = hits.filter((t) => t > cutoff);

  if (hits.length >= maxHits) {
    const oldestInWindow = hits[0];
    STORE.set(key, hits);
    if (oldestInWindow === undefined) {
      return {
        ok: false,
        retryAfterSeconds: Math.ceil(windowMs / 1000),
      };
    }
    const retryMs = Math.max(0, windowMs - (now - oldestInWindow) + 25);
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryMs / 1000)),
    };
  }

  hits.push(now);
  STORE.set(key, hits);

  if (STORE.size > MAX_KEYS) {
    for (const k of [...STORE.keys()]) {
      STORE.delete(k);
      if (STORE.size <= MAX_KEYS * 0.75) {
        break;
      }
    }
  }

  return { ok: true };
}
