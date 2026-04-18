/**
 * Single configured operator for admin analytics (`ADMIN_ANALYTICS_EMAIL`).
 * Not set in env → no one can sign in to `/admin` or view `/admin/dashboard`.
 */
export function getConfiguredAdminAnalyticsEmail(): string | null {
  const v = process.env.ADMIN_ANALYTICS_EMAIL?.trim();
  return v || null;
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
