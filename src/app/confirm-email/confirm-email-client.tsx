"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { confirmEmailAction } from "@/lib/auth/email-verification-actions";
import type { EmailVerificationConfirmState } from "@/lib/auth/email-verification-types";

const btnPrimary =
  "mt-6 w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/25 transition hover:bg-zinc-200 disabled:opacity-50";

type Props = {
  token: string;
};

export function ConfirmEmailClient({ token }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    EmailVerificationConfirmState,
    FormData
  >(confirmEmailAction, {});

  useEffect(() => {
    if (state?.succeeded) {
      router.replace("/resumes");
      router.refresh();
    }
  }, [state?.succeeded, router]);

  if (state?.succeeded) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-center text-sm text-zinc-300 shadow-2xl shadow-black/40 ring-1 ring-white/[0.05] sm:p-8">
        <p className="font-medium text-white">
          {state.alreadyVerified
            ? "Your email is already confirmed."
            : "Your email is confirmed. Taking you to your resumes…"}
        </p>
        <p className="mt-4 text-zinc-500">
          If nothing happens,{" "}
          <Link
            href="/resumes"
            className="font-semibold text-zinc-300 underline-offset-4 hover:text-white hover:underline"
          >
            continue here
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/40 ring-1 ring-white/[0.05] sm:p-8">
      <form action={formAction}>
        <input type="hidden" name="token" value={token} />
        {state?.error ? (
          <div className="space-y-3 text-center">
            <p className="text-sm font-medium text-red-400" role="alert">
              {state.error}
            </p>
            {state.invalidToken ? (
              <p className="text-sm text-zinc-500">
                <Link
                  href="/verify-email"
                  className="font-semibold text-zinc-300 underline-offset-4 transition hover:text-white hover:underline"
                >
                  Request a new confirmation email
                </Link>
                {" · "}
                <Link
                  href="/login"
                  className="font-semibold text-zinc-400 underline-offset-4 transition hover:text-zinc-200 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}
        <button type="submit" className={btnPrimary} disabled={pending}>
          {pending ? "Confirming…" : "Confirm and continue"}
        </button>
      </form>
    </div>
  );
}
