/** Max length aligned with click/status body validation for listing URLs. */
export const EMPLOYMENT_ALERT_JOB_URL_MAX_LEN = 5000;

/**
 * Allowed only when parseable by `URL`, scheme is exactly `http` or `https`, and hostname is non-empty.
 * Applies to Employment Alert `<JOB>/<url>` and any client/server copy of those links.
 */
export function isAllowedEmploymentAlertJobUrl(urlText: string): boolean {
  const t = urlText.trim();
  if (!t || t.length > EMPLOYMENT_ALERT_JOB_URL_MAX_LEN) {
    return false;
  }
  let u: URL;
  try {
    u = new URL(t);
  } catch {
    return false;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    return false;
  }
  return u.hostname.length > 0;
}
