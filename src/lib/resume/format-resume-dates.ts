const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/**
 * Display helper for resume dates stored as `YYYY-MM`, plain year, or free text.
 * Examples: `2024-01` → `Jan 2024`, `August 2023` → unchanged.
 */
export function formatMonthYearDisplay(
  raw: string | undefined | null,
): string {
  const s = String(raw ?? "").trim();
  if (!s) {
    return "";
  }
  const iso = /^(\d{4})-(\d{2})$/.exec(s);
  if (iso) {
    const y = Number(iso[1]);
    const mo = Number(iso[2]) - 1;
    if (y > 0 && mo >= 0 && mo <= 11) {
      return `${SHORT_MONTHS[mo]} ${y}`;
    }
  }
  if (/^\d{4}$/.test(s)) {
    return s;
  }
  return s;
}

/** Range for experience (end `null` = current role). */
export function formatResumeDateRange(
  start?: string,
  end?: string | null,
): string {
  const left = formatMonthYearDisplay(start);
  const right =
    end === null
      ? "Present"
      : end === undefined || String(end).trim() === ""
        ? "—"
        : formatMonthYearDisplay(String(end));
  if (!left && !right) {
    return "";
  }
  return `${left || "—"} – ${right}`;
}
