import { coerceResumeTemplateId } from "@/lib/resume/templates/registry";

/**
 * Strong visual differentiation for template gallery mini-previews only.
 * Editor / default preview stays neutral; PDF uses separate styling.
 */
export type GalleryPreviewChrome = {
  innerCard: string;
  innerPad: string;
  header: string;
  name: string;
  contact: string;
  links: string;
  badge: string;
  sectionTitle: string;
  bodyText: string;
  mainStack: string;
  twoColGrid: string;
  twoColMain: string;
  twoColAside: string;
};

const SECTION_CAPS_RULE =
  "mb-2.5 border-b border-zinc-200 pb-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:border-zinc-700 dark:text-zinc-500";

export function galleryPreviewChrome(
  templateIdRaw: string,
): GalleryPreviewChrome {
  const id = coerceResumeTemplateId(templateIdRaw);

  const baseInnerCard =
    "relative overflow-hidden rounded-sm bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-zinc-900/[0.04] dark:bg-zinc-50 dark:ring-zinc-900/20";

  const professionalChrome: GalleryPreviewChrome = {
    innerCard: baseInnerCard,
    innerPad: "p-6 md:p-7",
    header:
      "rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-5 text-center dark:border-zinc-300 dark:bg-zinc-100",
    name: "text-[1.62rem] font-semibold tracking-tight text-zinc-950",
    contact: "mt-2 text-[0.78rem] font-medium text-zinc-600",
    links: "mt-2.5 text-[0.72rem] text-zinc-700",
    badge: "mt-3 text-[0.58rem] font-medium uppercase tracking-wider text-zinc-500",
    sectionTitle: SECTION_CAPS_RULE,
    bodyText: "text-[0.8125rem] leading-relaxed text-zinc-800",
    mainStack: "mt-7 space-y-7",
    twoColGrid:
      "mt-7 grid gap-7 text-[0.8125rem] leading-relaxed md:grid-cols-[minmax(0,1fr)_min(174px,31%)]",
    twoColMain: "min-w-0 space-y-7",
    twoColAside:
      "min-w-0 space-y-5 rounded-md border border-zinc-200 bg-zinc-50 p-3 md:border-l md:pl-4 dark:border-zinc-200 dark:bg-zinc-100/90",
  };

  switch (id) {
    case "classic":
      return {
        innerCard: baseInnerCard,
        innerPad: "p-6 md:p-7",
        header: "border-b border-zinc-300 pb-5 text-center dark:border-zinc-300",
        name: "font-serif text-[1.55rem] font-semibold tracking-tight text-zinc-950 md:text-[1.65rem]",
        contact: "mt-2 text-[0.78rem] font-medium text-zinc-600",
        links: "mt-2.5 text-[0.72rem] text-zinc-700",
        badge: "mt-3 text-[0.58rem] font-medium uppercase tracking-wider text-zinc-400",
        sectionTitle: SECTION_CAPS_RULE,
        bodyText: "text-[0.8rem] leading-relaxed text-zinc-800",
        mainStack: "mt-7 space-y-7",
        twoColGrid: "mt-7 grid gap-6 text-[0.8rem] leading-relaxed md:grid-cols-[minmax(0,1fr)_min(168px,30%)] md:gap-7",
        twoColMain: "min-w-0 space-y-7",
        twoColAside:
          "min-w-0 space-y-5 rounded-md border border-zinc-200 bg-zinc-50/90 p-3 md:border-l md:pl-4 dark:border-zinc-200 dark:bg-zinc-100/80",
      };
    case "modern":
      return {
        innerCard: baseInnerCard,
        innerPad: "p-6 md:p-7",
        header: "border-b-2 border-zinc-900 pb-4 text-left dark:border-zinc-900",
        name: "text-[1.72rem] font-semibold tracking-tight text-zinc-900",
        contact: "mt-2 text-[0.76rem] font-medium text-zinc-600",
        links: "mt-2 text-[0.7rem] text-zinc-700",
        badge: "mt-3 text-[0.55rem] font-bold uppercase tracking-[0.22em] text-zinc-500",
        sectionTitle:
          "mb-2 border-b border-zinc-200 pb-1 text-[0.58rem] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:border-zinc-300",
        bodyText: "text-[0.78rem] leading-relaxed text-zinc-800",
        mainStack: "mt-8 space-y-9",
        twoColGrid:
          "mt-8 grid gap-7 text-[0.78rem] leading-relaxed md:grid-cols-[minmax(0,1fr)_min(172px,31%)]",
        twoColMain: "min-w-0 space-y-9",
        twoColAside:
          "min-w-0 space-y-5 border-l-2 border-zinc-900 pl-4 dark:border-zinc-900",
      };
    case "executive":
      return {
        innerCard: baseInnerCard,
        innerPad: "p-6 md:p-7",
        header:
          "border-b-4 border-zinc-900 pb-4 text-left dark:border-zinc-900",
        name: "text-[1.82rem] font-bold tracking-tight text-zinc-950",
        contact: "mt-2 text-[0.76rem] font-semibold text-zinc-600",
        links: "mt-2 text-[0.7rem] text-zinc-700",
        badge: "mt-3 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-zinc-500",
        sectionTitle:
          "mb-2 text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-zinc-600",
        bodyText: "text-[0.8rem] leading-relaxed text-zinc-800",
        mainStack: "mt-7 space-y-8",
        twoColGrid:
          "mt-7 grid gap-6 text-[0.8rem] leading-relaxed md:grid-cols-[minmax(0,1fr)_min(176px,32%)] md:gap-8",
        twoColMain: "min-w-0 space-y-8",
        twoColAside:
          "min-w-0 space-y-5 border-l border-zinc-400 pl-5 dark:border-zinc-400",
      };
    case "minimal":
      return {
        innerCard: baseInnerCard,
        innerPad: "p-7 md:p-8",
        header: "border-0 pb-6 text-left",
        name: "text-[1.48rem] font-medium tracking-tight text-zinc-800",
        contact: "mt-2 text-[0.76rem] text-zinc-500",
        links: "mt-2 text-[0.7rem] text-zinc-600",
        badge: "mt-4 text-[0.55rem] font-medium text-zinc-400",
        sectionTitle:
          "mb-2 text-xs font-medium normal-case tracking-normal text-zinc-500",
        bodyText: "text-[0.8rem] leading-[1.65] text-zinc-800",
        mainStack: "mt-10 space-y-12",
        twoColGrid:
          "mt-10 grid gap-10 text-[0.8rem] leading-[1.65] md:grid-cols-[minmax(0,1fr)_min(170px,30%)]",
        twoColMain: "min-w-0 space-y-12",
        twoColAside: "min-w-0 space-y-6 border-l border-zinc-200 pl-6 dark:border-zinc-300",
      };
    case "professional":
      return professionalChrome;
    case "two-column":
      return {
        innerCard: baseInnerCard,
        innerPad: "p-5 md:p-6",
        header: "border-b border-zinc-200 pb-4 text-left dark:border-zinc-300",
        name: "text-[1.68rem] font-bold tracking-tight text-zinc-950",
        contact: "mt-1.5 text-[0.74rem] font-medium text-zinc-600",
        links: "mt-2 text-[0.68rem] text-zinc-700",
        badge: "mt-2.5 text-[0.55rem] font-semibold uppercase tracking-wider text-zinc-500",
        sectionTitle:
          "mb-2 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-zinc-600",
        bodyText: "text-[0.78rem] leading-relaxed text-zinc-800",
        mainStack: "mt-6 space-y-6",
        twoColGrid:
          "mt-6 grid gap-5 text-[0.78rem] leading-relaxed md:grid-cols-[minmax(0,1fr)_min(190px,36%)] md:gap-6",
        twoColMain: "min-w-0 space-y-6",
        twoColAside:
          "min-w-0 space-y-4 rounded-md bg-zinc-100 p-4 ring-1 ring-zinc-200 dark:bg-zinc-100 dark:ring-zinc-300",
      };
    case "clean-accent":
      return {
        innerCard: `${baseInnerCard} border-l-4 border-teal-600`,
        innerPad: "p-6 md:p-7 pl-5",
        header: "border-b border-teal-100 pb-4 text-left dark:border-teal-900/40",
        name: "text-[1.62rem] font-semibold tracking-tight text-zinc-900",
        contact: "mt-2 text-[0.76rem] text-zinc-600",
        links: "mt-2 text-[0.7rem] text-zinc-700",
        badge: "mt-3 text-[0.55rem] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-600",
        sectionTitle:
          "mb-2 border-l-2 border-teal-600 pl-2 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-zinc-800 dark:border-teal-500",
        bodyText: "text-[0.8rem] leading-relaxed text-zinc-800",
        mainStack: "mt-7 space-y-7",
        twoColGrid:
          "mt-7 grid gap-6 text-[0.8rem] leading-relaxed md:grid-cols-[minmax(0,1fr)_min(170px,31%)]",
        twoColMain: "min-w-0 space-y-7",
        twoColAside:
          "min-w-0 space-y-4 border-l-2 border-teal-500/70 bg-teal-50/60 pl-3 dark:border-teal-600 dark:bg-teal-950/20",
      };
    case "bold-header":
      return {
        innerCard: baseInnerCard,
        innerPad: "p-6 md:p-7",
        header:
          "border-b-4 border-zinc-900 pb-5 text-center dark:border-zinc-900",
        name: "text-[1.95rem] font-black uppercase leading-[1.05] tracking-tight text-zinc-950 md:text-[2.05rem]",
        contact:
          "mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-600",
        links: "mt-2 text-[0.66rem] font-medium text-zinc-700",
        badge: "mt-3 text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-900",
        sectionTitle:
          "mb-2 border-b-2 border-zinc-300 pb-2 text-[0.58rem] font-black uppercase tracking-[0.2em] text-zinc-900 dark:border-zinc-400",
        bodyText: "text-[0.78rem] font-medium leading-relaxed text-zinc-800",
        mainStack: "mt-6 space-y-6",
        twoColGrid:
          "mt-6 grid gap-5 text-[0.78rem] font-medium leading-relaxed md:grid-cols-[minmax(0,1fr)_min(168px,30%)]",
        twoColMain: "min-w-0 space-y-6",
        twoColAside:
          "min-w-0 space-y-4 border-t-4 border-zinc-900 bg-zinc-50 pt-3 md:border-l md:border-t-0 md:pl-4 dark:border-zinc-900 dark:bg-zinc-100",
      };
    case "blue-professional":
      return {
        innerCard: `${baseInnerCard} border-l-4 border-blue-900`,
        innerPad: "p-6 md:p-7 pl-5",
        header:
          "border-b border-blue-200 bg-blue-50/50 pb-4 text-left dark:border-blue-900/40 dark:bg-blue-950/30",
        name: "text-[1.62rem] font-semibold tracking-tight text-blue-950 dark:text-blue-100",
        contact: "mt-2 text-[0.76rem] font-medium text-zinc-700 dark:text-zinc-300",
        links: "mt-2 text-[0.7rem] text-zinc-700 dark:text-zinc-300",
        badge: "mt-3 text-[0.55rem] font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-300",
        sectionTitle:
          "mb-2 border-b-2 border-blue-800 pb-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-blue-950 dark:border-blue-400 dark:text-blue-100",
        bodyText: "text-[0.8rem] leading-relaxed text-zinc-800 dark:text-zinc-200",
        mainStack: "mt-7 space-y-7",
        twoColGrid:
          "mt-7 grid gap-6 text-[0.8rem] leading-relaxed md:grid-cols-[minmax(0,1fr)_min(172px,31%)]",
        twoColMain: "min-w-0 space-y-7",
        twoColAside:
          "min-w-0 space-y-4 border-l-2 border-blue-800/80 bg-blue-50/70 pl-3 dark:border-blue-500 dark:bg-blue-950/40",
      };
    case "emerald-modern":
      return {
        innerCard: `${baseInnerCard} border-l-4 border-emerald-600`,
        innerPad: "p-6 md:p-7 pl-5",
        header:
          "border-b border-emerald-200 pb-4 text-left dark:border-emerald-900/50",
        name: "text-[1.68rem] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50",
        contact: "mt-2 text-[0.76rem] text-zinc-600 dark:text-zinc-400",
        links: "mt-2 text-[0.7rem] text-zinc-700 dark:text-zinc-300",
        badge: "mt-3 text-[0.55rem] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400",
        sectionTitle:
          "mb-2 border-l-2 border-emerald-600 pl-2 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-emerald-950 dark:border-emerald-500 dark:text-emerald-100",
        bodyText: "text-[0.8rem] leading-relaxed text-zinc-800 dark:text-zinc-200",
        mainStack: "mt-7 space-y-8",
        twoColGrid:
          "mt-7 grid gap-7 text-[0.8rem] leading-relaxed md:grid-cols-[minmax(0,1fr)_min(172px,31%)]",
        twoColMain: "min-w-0 space-y-8",
        twoColAside:
          "min-w-0 space-y-4 border-l-2 border-emerald-600/80 bg-emerald-50/80 pl-3 dark:border-emerald-500 dark:bg-emerald-950/25",
      };
    case "executive-accent":
      return {
        innerCard: `${baseInnerCard} border-l-4 border-rose-900`,
        innerPad: "p-6 md:p-7 pl-5",
        header:
          "border-b border-amber-200/90 bg-amber-50/40 pb-4 text-left dark:border-amber-900/40 dark:bg-amber-950/20",
        name: "text-[1.7rem] font-bold tracking-tight text-zinc-900 dark:text-zinc-50",
        contact: "mt-2 text-[0.76rem] text-zinc-700 dark:text-zinc-300",
        links: "mt-2 text-[0.7rem] text-zinc-700 dark:text-zinc-300",
        badge: "mt-3 text-[0.55rem] font-semibold uppercase tracking-wider text-rose-900 dark:text-rose-300",
        sectionTitle:
          "mb-2 border-l-2 border-amber-700 pl-2 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-rose-950 dark:border-amber-500 dark:text-rose-100",
        bodyText: "text-[0.8rem] leading-relaxed text-zinc-800 dark:text-zinc-200",
        mainStack: "mt-7 space-y-7",
        twoColGrid:
          "mt-7 grid gap-6 text-[0.8rem] leading-relaxed md:grid-cols-[minmax(0,1fr)_min(172px,31%)]",
        twoColMain: "min-w-0 space-y-7",
        twoColAside:
          "min-w-0 space-y-4 border-l-2 border-amber-700/70 bg-amber-50/50 pl-3 dark:border-amber-600 dark:bg-rose-950/30",
      };
    default:
      return professionalChrome;
  }
}
