/** Client / server shared (no secrets). Validates app-internal paths passed through Stripe redirects. */

const RESUME_ROUTE = /^\/resumes(?:\/([a-zA-Z0-9_-]+))?$/;

/**
 * Normalize a Stripe / client-provided redirect target to a safe in-app pathname.
 * Returns `undefined` if the value cannot be normalized to an allow-listed path.
 */
export function sanitizeCheckoutReturnPath(raw: unknown): string | undefined {
  if (typeof raw !== "string") {
    return undefined;
  }
  const trimmed = decodeURIComponent(raw).trim().split(/[?#]/)[0] ?? "";
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return undefined;
  }
  if (trimmed === "/jobs") {
    return "/jobs";
  }
  const m = RESUME_ROUTE.exec(trimmed);
  if (!m) {
    return undefined;
  }
  if (trimmed === "/resumes") {
    return "/resumes";
  }
  return `/resumes/${m[1]}`;
}
