"use client";

type ResumeCtaHelpTooltipProps = {
  ariaLabel: string;
  text: string;
};

export function ResumeCtaHelpTooltip({ ariaLabel, text }: ResumeCtaHelpTooltipProps) {
  return (
    <span className="group/help pointer-events-auto absolute right-2 top-2 z-10">
      <button
        type="button"
        className="flex size-5 cursor-pointer items-center justify-center rounded-full border border-zinc-400 bg-white/95 text-[10px] font-bold leading-none text-zinc-700 shadow-sm transition hover:border-zinc-600 hover:bg-white dark:border-zinc-500 dark:bg-zinc-900/95 dark:text-zinc-200 dark:hover:border-zinc-400"
        aria-label={ariaLabel}
      >
        ?
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+6px)] right-0 z-20 w-max max-w-[min(18rem,calc(100vw-2rem))] rounded-lg bg-zinc-900 px-3 py-2 text-left text-xs font-medium leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 ease-out group-hover/help:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
