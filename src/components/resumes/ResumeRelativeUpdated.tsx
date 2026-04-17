"use client";

import { useMemo } from "react";

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatAbsolute(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Friendly relative label in the user's local timezone. */
export function resumeRelativeUpdatedLabel(iso: string): string {
  const updated = new Date(iso);
  if (Number.isNaN(updated.getTime())) {
    return `Updated ${formatAbsolute(iso)}`;
  }

  const now = new Date();
  if (updated.getTime() > now.getTime() + 60_000) {
    return `Updated ${formatAbsolute(iso)}`;
  }

  const dayDiff = Math.round(
    (startOfLocalDay(now).getTime() - startOfLocalDay(updated).getTime()) /
      86_400_000,
  );

  if (dayDiff === 0) {
    return "Updated today";
  }
  if (dayDiff === 1) {
    return "Updated yesterday";
  }
  if (dayDiff >= 2 && dayDiff <= 7) {
    return `Updated ${dayDiff}d ago`;
  }

  return `Updated ${formatAbsolute(iso)}`;
}

type Props = {
  updatedAtIso: string;
  className?: string;
};

export function ResumeRelativeUpdated({ updatedAtIso, className }: Props) {
  const label = useMemo(
    () => resumeRelativeUpdatedLabel(updatedAtIso),
    [updatedAtIso],
  );
  return <span className={className}>{label}</span>;
}
