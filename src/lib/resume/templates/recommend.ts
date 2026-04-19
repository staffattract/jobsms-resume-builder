import type { ResumeContent } from "@/lib/resume/types";
import { DEFAULT_RESUME_TEMPLATE_ID } from "@/lib/resume/templates/registry";

/**
 * V1 deterministic template recommendation (no LLM).
 * Heuristics only — users can always override in the gallery.
 */
export function recommendTemplateFromContent(
  content: ResumeContent,
): string {
  const jobs = content.experience.items.filter(
    (j) => j.employer.trim() && j.title.trim(),
  );
  const bulletCount = content.experience.items.reduce(
    (n, j) => n + j.bullets.filter((b) => b.text.trim()).length,
    0,
  );
  const edu = content.education.items.length;
  const summaryLen = content.summary.text.trim().length;
  const targetRich =
    (content.target.jobTitle?.trim() || "").length +
      (content.target.company?.trim() || "").length >
    40;

  // Student / entry: little work history, education present
  if (jobs.length <= 1 && bulletCount <= 4 && edu >= 1) {
    return bulletCount <= 2 ? "minimal" : "classic";
  }

  if (jobs.length <= 1 && bulletCount <= 6) {
    return "classic";
  }

  // Long professional narrative → executive / modern
  if (jobs.length >= 3 && bulletCount >= 14) {
    return "executive";
  }
  if (jobs.length >= 2 && bulletCount >= 10 && (summaryLen > 350 || targetRich)) {
    return "modern";
  }
  if (bulletCount >= 12) {
    return "executive";
  }

  // Skills-heavy profiles → two-column reads well in V1 renderer
  const skillItems = content.skills.groups.reduce(
    (n, g) => n + g.items.filter((s) => s.trim()).length,
    0,
  );
  if (skillItems >= 18 && jobs.length >= 2) {
    return "two-column";
  }

  return DEFAULT_RESUME_TEMPLATE_ID;
}
