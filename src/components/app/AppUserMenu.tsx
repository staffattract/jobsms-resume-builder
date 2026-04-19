"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type AppUserMenuProps = {
  email: string;
  logoutAction: () => Promise<void>;
};

export function AppUserMenu({ email, logoutAction }: AppUserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const triggerClasses =
    "inline-flex max-w-full min-w-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.99] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 sm:px-4";

  return (
    <div ref={rootRef} className="relative min-w-0 shrink-0">
      <button
        type="button"
        className={triggerClasses}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="min-w-0 flex-1 truncate" title={email}>
          {email}
        </span>
        <span className="shrink-0 text-zinc-500 dark:text-zinc-400" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(calc(100vw-2rem),20rem)] overflow-hidden rounded-2xl border border-zinc-200/90 bg-white py-2 shadow-lg shadow-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/40"
        >
          <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
              Signed in as
            </p>
            <p className="mt-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100" title={email}>
              {email}
            </p>
          </div>
          <div className="py-1">
            <Link
              href="/account"
              role="menuitem"
              className="block px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              onClick={close}
            >
              My account
            </Link>
            <Link
              href="/resumes"
              role="menuitem"
              className="block px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              onClick={close}
            >
              Resumes
            </Link>
          </div>
          <div className="border-t border-zinc-200 px-2 py-2 dark:border-zinc-800">
            <form action={logoutAction} className="block">
              <button
                type="submit"
                role="menuitem"
                className="w-full rounded-xl px-2 py-2.5 text-left text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
