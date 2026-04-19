export type ResumeTemplateLayout = "single" | "two-column";

export type ResumeTemplateDefinition = {
  id: string;
  name: string;
  tagline: string;
  categories: string[];
  layout: ResumeTemplateLayout;
  /** Full Tailwind classes for the gallery swatch (static strings for JIT). */
  previewClass: string;
};

export const DEFAULT_RESUME_TEMPLATE_ID = "professional";

export const RESUME_TEMPLATES: ResumeTemplateDefinition[] = [
  {
    id: "classic",
    name: "Classic",
    tagline: "Timeless single-column layout with clear hierarchy.",
    categories: ["classic", "traditional"],
    layout: "single",
    previewClass: "bg-gradient-to-br from-zinc-200 to-zinc-400",
  },
  {
    id: "modern",
    name: "Modern",
    tagline: "Crisp spacing and strong typographic rhythm.",
    categories: ["modern", "professional"],
    layout: "single",
    previewClass: "bg-gradient-to-br from-slate-300 to-zinc-600",
  },
  {
    id: "executive",
    name: "Executive",
    tagline: "Confident presence for senior roles and depth of experience.",
    categories: ["executive", "modern"],
    layout: "single",
    previewClass: "bg-gradient-to-br from-zinc-700 to-zinc-900",
  },
  {
    id: "minimal",
    name: "Minimal",
    tagline: "Maximum clarity with understated structure.",
    categories: ["minimal", "clean"],
    layout: "single",
    previewClass: "bg-gradient-to-br from-zinc-100 to-zinc-300",
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "Balanced default that works across industries.",
    categories: ["professional", "classic"],
    layout: "single",
    previewClass: "bg-gradient-to-br from-zinc-300 to-zinc-500",
  },
  {
    id: "two-column",
    name: "Two Column",
    tagline: "Sidebar for skills and education; main column for story.",
    categories: ["two-column", "modern"],
    layout: "two-column",
    previewClass: "bg-gradient-to-br from-zinc-500 to-zinc-800",
  },
  {
    id: "clean-accent",
    name: "Clean Accent",
    tagline: "Subtle accent rule under section headings.",
    categories: ["clean", "modern"],
    layout: "single",
    previewClass: "bg-gradient-to-br from-emerald-200 to-zinc-500",
  },
  {
    id: "bold-header",
    name: "Bold Header",
    tagline: "Prominent name block and bold section breaks.",
    categories: ["creative", "bold"],
    layout: "single",
    previewClass: "bg-gradient-to-br from-zinc-800 to-black",
  },
  {
    id: "blue-professional",
    name: "Blue Professional",
    tagline: "Navy accents and a crisp corporate rhythm—still ATS-friendly.",
    categories: ["professional", "corporate", "accent"],
    layout: "single",
    previewClass: "bg-gradient-to-br from-slate-800 to-blue-900",
  },
  {
    id: "emerald-modern",
    name: "Emerald Modern",
    tagline: "Emerald highlights with a clean, contemporary structure.",
    categories: ["modern", "accent", "professional"],
    layout: "single",
    previewClass: "bg-gradient-to-br from-emerald-700 to-zinc-800",
  },
  {
    id: "executive-accent",
    name: "Executive Accent",
    tagline: "Burgundy and muted gold touches for a refined executive look.",
    categories: ["executive", "premium", "accent"],
    layout: "single",
    previewClass: "bg-gradient-to-br from-rose-950 to-amber-900",
  },
];

const TEMPLATE_BY_ID = new Map(
  RESUME_TEMPLATES.map((t) => [t.id, t] as const),
);

export function isValidResumeTemplateId(id: string): boolean {
  return TEMPLATE_BY_ID.has(id);
}

export function coerceResumeTemplateId(id: string | undefined): string {
  if (id && isValidResumeTemplateId(id)) {
    return id;
  }
  return DEFAULT_RESUME_TEMPLATE_ID;
}

export function getResumeTemplateDefinition(
  id: string,
): ResumeTemplateDefinition {
  return TEMPLATE_BY_ID.get(id) ?? TEMPLATE_BY_ID.get(DEFAULT_RESUME_TEMPLATE_ID)!;
}
