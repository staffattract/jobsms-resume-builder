import type { ResumeContent } from "@/lib/resume/types";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatRange(
  start?: string,
  end?: string | null,
): string {
  const a = (start ?? "").trim();
  const b =
    end === null || end === undefined
      ? "Present"
      : String(end).trim() || "—";
  if (!a && !b) {
    return "";
  }
  return `${a || "—"} – ${b}`;
}

export function buildResumePdfHtml(title: string, content: ResumeContent): string {
  const { contact, target, summary, experience, skills, education } = content;

  const name = escapeHtml(contact.fullName?.trim() || title.trim() || "Resume");
  const contactBits = [
    contact.email?.trim(),
    contact.phone?.trim(),
    contact.location?.trim(),
  ]
    .filter(Boolean)
    .map((t) => escapeHtml(t!));

  const linksHtml = contact.links
    .filter((l) => l.label?.trim() || l.url?.trim())
    .map((l) => {
      const label = escapeHtml(l.label?.trim() || l.url?.trim() || "");
      const url = l.url?.trim();
      if (url) {
        const safeUrl = escapeHtml(url);
        return `<span class="link">${label} — ${safeUrl}</span>`;
      }
      return `<span class="link">${label}</span>`;
    })
    .join(" · ");

  const targetLine = [target.jobTitle?.trim(), target.company?.trim()]
    .filter(Boolean)
    .map((t) => escapeHtml(t!))
    .join(" · ");

  const summaryHtml = summary.text?.trim()
    ? `<section class="block"><h2>Summary</h2><p class="body">${escapeHtml(summary.text.trim()).replace(/\n/g, "<br/>")}</p></section>`
    : "";

  const expHtml =
    experience.items.length > 0
      ? `<section class="block"><h2>Experience</h2>${experience.items
          .map((job) => {
            const head = `${escapeHtml(job.title || "Role")} — ${escapeHtml(job.employer || "")}`;
            const loc = job.location?.trim()
              ? `<div class="muted">${escapeHtml(job.location)}</div>`
              : "";
            const dates = formatRange(job.startDate, job.endDate);
            const datesHtml = dates
              ? `<div class="muted small">${escapeHtml(dates)}</div>`
              : "";
            const bullets = job.bullets
              .filter((b) => b.text.trim())
              .map((b) => `<li>${escapeHtml(b.text.trim())}</li>`)
              .join("");
            const ul = bullets ? `<ul>${bullets}</ul>` : "";
            return `<div class="job"><div class="job-head">${head}</div>${loc}${datesHtml}${ul}</div>`;
          })
          .join("")}</section>`
      : "";

  const skillsHtml =
    skills.groups.some((g) => g.name.trim() || g.items.some((i) => i.trim()))
      ? `<section class="block"><h2>Skills</h2>${skills.groups
          .map((g) => {
            const nameEsc = escapeHtml(g.name.trim() || "Skills");
            const items = g.items
              .filter((s) => s.trim())
              .map((s) => escapeHtml(s.trim()))
              .join(", ");
            if (!items && !g.name.trim()) {
              return "";
            }
            return `<div class="skill-group"><strong>${nameEsc}</strong><div class="body">${items}</div></div>`;
          })
          .filter(Boolean)
          .join("")}</section>`
      : "";

  const eduHtml =
    education.items.length > 0
      ? `<section class="block"><h2>Education</h2>${education.items
          .map((ed) => {
            const inst = escapeHtml(ed.institution.trim() || "School");
            const line = [ed.degree?.trim(), ed.field?.trim()]
              .filter(Boolean)
              .map((t) => escapeHtml(t!))
              .join(", ");
            const dates = formatRange(ed.startDate, ed.endDate ?? undefined);
            const details = ed.details?.trim()
              ? `<p class="body small">${escapeHtml(ed.details.trim()).replace(/\n/g, "<br/>")}</p>`
              : "";
            return `<div class="edu"><strong>${inst}</strong>${line ? `<div>${line}</div>` : ""}${dates ? `<div class="muted small">${escapeHtml(dates)}</div>` : ""}${details}</div>`;
          })
          .join("")}</section>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(title.trim() || "Resume")}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Helvetica, Arial, sans-serif; font-size: 11pt; color: #111; line-height: 1.45; margin: 0; padding: 36pt 40pt; }
    h1 { font-size: 20pt; font-weight: 700; margin: 0 0 6pt; letter-spacing: -0.02em; }
    h2 { font-size: 11pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #333; border-bottom: 1pt solid #ccc; padding-bottom: 4pt; margin: 18pt 0 8pt; }
    .contact-line { font-size: 10pt; color: #333; margin-bottom: 4pt; }
    .links { font-size: 9pt; color: #444; margin-bottom: 8pt; }
    .link { white-space: nowrap; }
    .target { font-size: 10pt; font-weight: 600; color: #222; margin-bottom: 12pt; }
    .block { margin-bottom: 4pt; }
    .body { margin: 0; }
    .muted { color: #555; font-size: 9.5pt; margin-top: 2pt; }
    .small { font-size: 9pt; }
    .job { margin-bottom: 12pt; page-break-inside: avoid; }
    .job-head { font-weight: 600; font-size: 11pt; }
    ul { margin: 6pt 0 0 14pt; padding: 0; }
    li { margin-bottom: 3pt; }
    .skill-group { margin-bottom: 8pt; }
    .edu { margin-bottom: 10pt; page-break-inside: avoid; }
  </style>
</head>
<body>
  <h1>${name}</h1>
  ${contactBits.length ? `<div class="contact-line">${contactBits.join(" · ")}</div>` : ""}
  ${linksHtml ? `<div class="links">${linksHtml}</div>` : ""}
  ${targetLine ? `<div class="target">${targetLine}</div>` : ""}
  ${summaryHtml}
  ${expHtml}
  ${skillsHtml}
  ${eduHtml}
</body>
</html>`;
}
