"use client";

import { useEffect, useState } from "react";
import { btnSecondary } from "@/components/resume/form-classes";

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

  const benefits = [
    "Print-ready PDF optimized for ATS and recruiters",
    "Download again whenever you update your resume",
    "Secure checkout powered by Stripe",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-paywall-title"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xl shadow-zinc-950/20 md:p-8 dark:border-zinc-700 dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
            Professional export
          </p>
          <h2
            id="pdf-paywall-title"
            className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-[1.65rem]"
          >
            Unlock polished PDF downloads
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Keep building for free. When you’re ready to apply, export a crisp PDF
            that matches what employers expect.
          </p>
        </div>

        <ul className="mx-auto mt-8 max-w-lg space-y-3">
          {benefits.map((line) => (
            <li
              key={line}
              className="flex gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 px-4 py-3 text-left text-sm font-medium text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200"
            >
              <CheckIcon className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        {error ? (
          <p className="mt-5 text-center text-sm font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-5">
          <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              One-time PDF
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Single export — ideal for one application cycle or a final send.
            </p>
            <p className="mt-3 text-xs font-medium text-zinc-500 dark:text-zinc-500">
              Price in secure checkout
            </p>
            <button
              type="button"
              className="mt-4 w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              disabled={loadingKind !== null}
              onClick={() => void startCheckout("one_time")}
            >
              {loadingKind === "one_time" ? "Redirecting…" : "Continue"}
            </button>
          </div>

          <div className="relative flex flex-col rounded-2xl border-2 border-emerald-600/90 bg-gradient-to-b from-emerald-50/90 to-white p-5 shadow-lg shadow-emerald-950/10 ring-2 ring-emerald-600/20 dark:border-emerald-500 dark:from-emerald-950/50 dark:to-zinc-950 dark:ring-emerald-500/30">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Best value
            </span>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Monthly subscription
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              Unlimited PDFs while subscribed — perfect while you iterate and
              tailor for roles.
            </p>
            <p className="mt-3 text-xs font-medium text-emerald-800/80 dark:text-emerald-300/90">
              Price in secure checkout
            </p>
            <button
              type="button"
              className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400"
              disabled={loadingKind !== null}
              onClick={() => void startCheckout("subscription")}
            >
              {loadingKind === "subscription" ? "Redirecting…" : "Continue"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
          Payments are processed securely by Stripe. No card details are stored on
          our servers.
        </p>

        <div className="mt-6 flex justify-center">
          <button type="button" className={btnSecondary} onClick={onClose}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
