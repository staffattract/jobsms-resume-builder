import {
  coerceResumeTemplateId,
  getResumeTemplateDefinition,
} from "@/lib/resume/templates/registry";

/** Base PDF styles shared by all templates. */
const PDF_BASE_CSS = `
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
    .grid2 { display: flex; gap: 16pt; align-items: flex-start; }
    .col-main { flex: 1 1 62%; min-width: 0; }
    .col-side { flex: 0 0 34%; font-size: 9.5pt; }
    .col-side h2 { font-size: 10pt; }
`;

const TEMPLATE_CSS: Record<string, string> = {
  classic: `
    body.tpl-classic h2 { border-bottom-color: #bbb; color: #222; }
  `,
  modern: `
    body.tpl-modern { letter-spacing: 0.01em; }
    body.tpl-modern h1 { font-size: 21pt; font-weight: 650; }
    body.tpl-modern h2 { border-bottom-width: 2pt; letter-spacing: 0.08em; }
  `,
  executive: `
    body.tpl-executive h1 { font-size: 22pt; }
    body.tpl-executive h2 { color: #111; border-bottom-color: #333; }
    body.tpl-executive .job-head { font-size: 11.5pt; }
  `,
  minimal: `
    body.tpl-minimal h2 { border-bottom: none; text-transform: none; font-size: 10.5pt; color: #444; padding-bottom: 0; margin-top: 14pt; }
    body.tpl-minimal { color: #222; }
  `,
  professional: `
    body.tpl-professional h2 { color: #2a2a2a; }
  `,
  "two-column": `
    body.tpl-two-column .grid2 { margin-top: 6pt; }
    body.tpl-two-column .col-side { border-left: 1pt solid #e5e5e5; padding-left: 12pt; }
  `,
  "clean-accent": `
    body.tpl-clean-accent h2 { border-bottom: none; border-left: 3pt solid #0d9488; padding-left: 8pt; color: #1f2937; }
  `,
  "bold-header": `
    body.tpl-bold-header h1 { font-size: 24pt; border-bottom: 2pt solid #111; padding-bottom: 8pt; margin-bottom: 10pt; }
    body.tpl-bold-header h2 { font-size: 11.5pt; color: #000; }
  `,
};

export function buildResumePdfTemplateCss(templateIdRaw: string): string {
  const id = coerceResumeTemplateId(templateIdRaw);
  const extra = TEMPLATE_CSS[id] ?? "";
  return `<style>\n${PDF_BASE_CSS}\n${extra}\n</style>`;
}

export function resumePdfLayoutIsTwoColumn(templateIdRaw: string): boolean {
  const id = coerceResumeTemplateId(templateIdRaw);
  return getResumeTemplateDefinition(id).layout === "two-column";
}
