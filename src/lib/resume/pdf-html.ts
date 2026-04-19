import { formatResumeDateRange } from "@/lib/resume/format-resume-dates";
import type { ResumeContent } from "@/lib/resume/types";
import { coerceResumeTemplateId } from "@/lib/resume/templates/registry";
import {
  buildResumePdfTemplateCss,
  resumePdfLayoutIsTwoColumn,
} from "@/lib/resume/templates/pdf-template";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildResumePdfHtml(title: string, content: ResumeContent): string {
  const { contact, target, summary, experience, skills, education } = content;
  const templateId = coerceResumeTemplateId(content.meta.templateId);
  const twoCol = resumePdfLayoutIsTwoColumn(templateId);
  const bodyClass = `tpl-${templateId.replace(/[^a-z0-9-]/gi, "")}`;

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
            const dates = formatResumeDateRange(job.startDate, job.endDate);
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
            const dates = formatResumeDateRange(
              ed.startDate,
              ed.endDate ?? undefined,
            );
            const details = ed.details?.trim()
              ? `<p class="body small">${escapeHtml(ed.details.trim()).replace(/\n/g, "<br/>")}</p>`
              : "";
            return `<div class="edu"><strong>${inst}</strong>${line ? `<div>${line}</div>` : ""}${dates ? `<div class="muted small">${escapeHtml(dates)}</div>` : ""}${details}</div>`;
          })
          .join("")}</section>`
      : "";

  const mainBlock = `${summaryHtml}${expHtml}`;
  const sideBlock = `${skillsHtml}${eduHtml}`;
  const stackedBody = `${summaryHtml}${expHtml}${skillsHtml}${eduHtml}`;
  const columns =
    twoCol && (mainBlock.trim() || sideBlock.trim())
      ? `<div class="grid2"><div class="col-main">${mainBlock}</div><div class="col-side">${sideBlock}</div></div>`
      : stackedBody;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(title.trim() || "Resume")}</title>
  ${buildResumePdfTemplateCss(templateId)}
</head>
<body class="${bodyClass}">
  <h1>${name}</h1>
  ${contactBits.length ? `<div class="contact-line">${contactBits.join(" · ")}</div>` : ""}
  ${linksHtml ? `<div class="links">${linksHtml}</div>` : ""}
  ${targetLine ? `<div class="target">${targetLine}</div>` : ""}
  ${columns}
</body>
</html>`;
}
