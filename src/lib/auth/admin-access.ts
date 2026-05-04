import { optionalEnvTrim } from "@/lib/env/server";

/**
 * Operator allowlist for admin analytics routes (`ADMIN_ANALYTICS_EMAIL`).
 *
 * See `docs/ENVIRONMENT.md` — **security**: omit in production unless you intentionally want
 * the dashboard; comparison is lowercased equality only (exact email match, no substring/wildcards).
 *
 * Empty / unset env → `/admin/dashboard` inaccessible (sign-in rejects); UI still exists but has no privileged user.
 */
export function getConfiguredAdminAnalyticsEmail(): string | null {
  return optionalEnvTrim("ADMIN_ANALYTICS_EMAIL") ?? null;
}

export function isAdminAnalyticsAuthorized(
  email: string | null | undefined,
): boolean {
  const admin = getConfiguredAdminAnalyticsEmail()?.toLowerCase();
  if (!admin || !email) {
    return false;
  }
  return email.trim().toLowerCase() === admin;
}
