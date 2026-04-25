import type { ResumeContent } from "@/lib/resume/types";

function tr(s: string | undefined): string {
  return (s ?? "").trim();
}

/** Dashboard and `/build` list title: full name, then target role, else default. */
export function deriveResumeListTitle(c: ResumeContent): string {
  const name = tr(c.contact.fullName);
  if (name) {
    return name.length > 120 ? `${name.slice(0, 117)}…` : name;
  }
  const jt = tr(c.target.jobTitle);
  if (jt) {
    return jt.length > 120 ? `${jt.slice(0, 117)}…` : jt;
  }
  return "Untitled Resume";
}

/** Enough content that “save to account” or continuing the interview is meaningful. */
export function hasMeaningfulBuildContent(c: ResumeContent): boolean {
  if (tr(c.contact.fullName)) {
    return true;
  }
  if (tr(c.target.jobTitle)) {
    return true;
  }
  if (c.experience.items.length) {
    return true;
  }
  return false;
}
