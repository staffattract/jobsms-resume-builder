"use client";

import { useEffect, useState } from "react";
type Props = {
  open: boolean;
  onClose: () => void;
};

type CheckoutKind = "one_time" | "subscription";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PdfPaywallModal({ open, onClose }: Props) {
  const [loadingKind, setLoadingKind] = useState<CheckoutKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setLoadingKind(null);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function startCheckout(kind: CheckoutKind) {
    setError(null);
    setLoadingKind(kind);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ kind }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
      };
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Could not start checkout. Try again.",
        );
        return;
      }
      if (typeof data.url === "string") {
        window.location.href = data.url;
        return;
      }
      setError("Could not start checkout. Try again.");
    } catch {
      setError("Could not start checkout. Try again.");
    } finally {
      setLoadingKind(null);
    }
  }

  if (!open) {
    return null;
  }

  const valueBullets = [
    "Clean, professional formatting",
    "Optimized for recruiters & ATS",
    "Ready to send immediately",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-paywall-title"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl shadow-black/50 ring-1 ring-white/[0.06] md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Unlock your PDF
          </p>
          <h2
            id="pdf-paywall-title"
            className="mt-2 text-2xl font-bold tracking-tight text-white md:text-[1.65rem]"
          >
            Your resume is ready
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
            $1 today, then $9.99/month after 10 days. Cancel anytime.
          </p>
        </div>

        {/* Preview: finished document, partially obscured */}
        <div
          className="relative mx-auto mt-7 max-w-md overflow-hidden rounded-xl border border-zinc-700/90 bg-zinc-100 shadow-lg shadow-black/40"
          aria-hidden
        >
          <div className="relative bg-gradient-to-b from-white to-zinc-100 px-5 pb-6 pt-5">
            <div className="mx-auto h-2 w-2/5 rounded bg-zinc-300" />
            <div className="mx-auto mt-3 h-1.5 w-3/5 rounded bg-zinc-200" />
            <div className="mt-5 space-y-2">
              <div className="h-1.5 w-full rounded bg-zinc-200" />
              <div className="h-1.5 w-[92%] rounded bg-zinc-200" />
              <div className="h-1.5 w-[88%] rounded bg-zinc-200" />
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="h-1 w-full rounded bg-zinc-200/90" />
              <div className="h-1 w-full rounded bg-zinc-200/90" />
              <div className="h-1 w-[95%] rounded bg-zinc-200/90" />
              <div className="h-1 w-full rounded bg-zinc-200/90" />
              <div className="h-1 w-[70%] rounded bg-zinc-200/90" />
            </div>
            <div className="mt-5 flex gap-2">
              <div className="h-12 flex-1 rounded-lg bg-zinc-200/80" />
              <div className="h-12 flex-1 rounded-lg bg-zinc-200/80" />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-25% via-zinc-950/50 to-zinc-950 backdrop-blur-[3px]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center border-t border-zinc-800/80 bg-zinc-950/85 px-4 py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Your resume · start $1 trial to download
            </span>
          </div>
        </div>

        <ul className="mx-auto mt-6 max-w-lg space-y-2">
          {valueBullets.map((line) => (
            <li
              key={line}
              className="flex gap-2.5 rounded-lg border border-zinc-800/90 bg-zinc-900/60 px-3.5 py-2.5 text-left text-sm font-medium text-zinc-200"
            >
              <CheckIcon className="mt-0.5 shrink-0 text-emerald-500" />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        {error ? (
          <p className="mt-5 text-center text-sm font-medium text-red-400">
            {error}
          </p>
        ) : null}

        <div className="mt-7 space-y-4">
          <div className="relative flex flex-col rounded-2xl border-2 border-emerald-500/85 bg-gradient-to-b from-emerald-950/55 to-zinc-900 p-5 shadow-xl shadow-emerald-950/25 ring-1 ring-emerald-500/20 sm:p-6">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-950 shadow-sm">
              Best value
            </span>
            <h3 className="text-sm font-semibold text-white">Resume Pro</h3>
            <p className="mt-2 text-2xl font-bold tracking-tight text-white">
              $1 today
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-300">
              $1 today, then $9.99/month after 10 days. Cancel anytime.
            </p>
            <p className="mt-3 flex-1 text-xs leading-relaxed text-zinc-500">
              Download instantly after checkout. Unlimited PDFs while subscribed.
            </p>
            <button
              type="button"
              className="mt-5 w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg transition hover:bg-emerald-400 disabled:opacity-50 sm:py-4 sm:text-base"
              disabled={loadingKind !== null}
              onClick={() => void startCheckout("subscription")}
            >
              {loadingKind === "subscription"
                ? "Redirecting…"
                : "Start $1 Trial & Download"}
            </button>
          </div>

          <div className="flex flex-col rounded-xl border border-zinc-800/90 bg-zinc-900/30 p-4 sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Prefer not to subscribe?
            </p>
            <h3 className="mt-1 text-sm font-semibold text-zinc-300">Single PDF</h3>
            <p className="mt-0.5 text-lg font-bold text-zinc-400">$4.99</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              One export, no subscription.
            </p>
            <button
              type="button"
              className="mt-3 w-full rounded-xl border border-zinc-600 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:opacity-50 sm:text-sm"
              disabled={loadingKind !== null}
              onClick={() => void startCheckout("one_time")}
            >
              {loadingKind === "one_time" ? "Redirecting…" : "Download once — $4.99"}
            </button>
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-zinc-400 sm:text-sm">
          Subscription billing begins after the 10-day intro unless you cancel in the
          billing portal. One-time checkout is a single charge only.
        </p>

        <p className="mt-3 text-center text-[11px] leading-relaxed text-zinc-500">
          Secure checkout powered by Stripe. Card details are not stored on our
          servers.
        </p>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-600 bg-transparent px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800/50 active:scale-[0.99]"
            onClick={onClose}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
