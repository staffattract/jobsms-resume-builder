"use client";

import { useActionState } from "react";
import { resendEmailVerificationAction } from "@/lib/auth/email-verification-actions";
import type { ResendVerificationState } from "@/lib/auth/email-verification-types";

const btnClass =
  "w-full rounded-xl border border-zinc-600 bg-zinc-900/80 py-3.5 text-sm font-semibold text-zinc-100 shadow-lg shadow-black/20 transition hover:border-zinc-500 hover:bg-zinc-800/90 disabled:opacity-50";

export function VerifyEmailClient() {
  const [state, formAction, pending] = useActionState<
    ResendVerificationState,
    FormData
  >(resendEmailVerificationAction, {});

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/40 ring-1 ring-white/[0.05] sm:p-8">
      <form action={formAction}>
        {state?.error ? (
          <p className="mb-4 text-center text-sm font-medium text-red-400" role="alert">
            {state.error}
          </p>
        ) : null}
        {state?.ok ? (
          <p
            className="mb-4 text-center text-sm font-medium text-emerald-300"
            role="status"
          >
            Confirmation email sent. Check your inbox (and spam).
          </p>
        ) : null}
        <button type="submit" className={btnClass} disabled={pending}>
          {pending ? "Sending…" : "Resend confirmation email"}
        </button>
      </form>
    </div>
  );
}
