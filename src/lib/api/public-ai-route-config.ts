/**
 * Abuse controls for public (unauthenticated) builder AI endpoints.
 */

export type PublicAiBuilderJsonRouteKey =
  | "improve-bullet"
  | "generate-summary"
  | "tailor-job"
  | "fill-partial"
  | "generate-scratch";

export type PublicAiProtectedRouteKey = PublicAiBuilderJsonRouteKey | "parse-upload";

type JsonRouteConfig = Readonly<{ maxPerWindow: number; maxBodyUtf8Bytes: number }>;
type UploadRouteConfig = Readonly<{ maxPerWindow: number; maxMultipartBytes: number }>;

const WINDOW_MS = 60_000;

const JSON_ROUTE_CONFIG: Record<PublicAiBuilderJsonRouteKey, JsonRouteConfig> = {
  "improve-bullet": { maxPerWindow: 10, maxBodyUtf8Bytes: 6_144 },
  "generate-summary": { maxPerWindow: 5, maxBodyUtf8Bytes: 98_304 },
  "tailor-job": { maxPerWindow: 5, maxBodyUtf8Bytes: 131_072 },
  "fill-partial": { maxPerWindow: 3, maxBodyUtf8Bytes: 98_304 },
  "generate-scratch": { maxPerWindow: 3, maxBodyUtf8Bytes: 65_536 },
};

const UPLOAD_ROUTE_CONFIG: UploadRouteConfig = {
  maxPerWindow: 3,
  maxMultipartBytes: 6 * 1024 * 1024,
};

export function rateLimitPolicyForJsonRoute(route: PublicAiBuilderJsonRouteKey): {
  maxPerWindow: number;
  windowMs: number;
  maxBodyUtf8Bytes: number;
} {
  const cfg = JSON_ROUTE_CONFIG[route];
  return {
    maxPerWindow: cfg.maxPerWindow,
    windowMs: WINDOW_MS,
    maxBodyUtf8Bytes: cfg.maxBodyUtf8Bytes,
  };
}

export function rateLimitPolicyForParseUpload(): {
  maxPerWindow: number;
  windowMs: number;
  maxMultipartBytes: number;
} {
  return {
    ...UPLOAD_ROUTE_CONFIG,
    windowMs: WINDOW_MS,
  };
}
