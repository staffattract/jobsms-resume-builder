"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type PollState = "idle" | "polling" | "ready" | "timeout";

export function CheckoutReturnClient() {
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";
  const sessionId = searchParams.get("session_id");

  const [pollState, setPollState] = useState<PollState>(() => {
    if (canceled || !sessionId) {
      return "idle";
    }
    return "polling";
  });

  useEffect(() => {
    if (canceled || !sessionId) {
      return;
    }
    let cancelled = false;

    async function run() {
      let attempts = 0;
      while (!cancelled && attempts < 45) {
        attempts += 1;
        const res = await fetch("/api/me/entitlements", { credentials: "include" });
        if (res.ok) {
          const data = (await res.json()) as { canDownloadPdf?: boolean };
          if (data.canDownloadPdf) {
            if (!cancelled) {
              setPollState("ready");
            }
            return;
          }
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      if (!cancelled) {
        setPollState("timeout");
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [canceled, sessionId]);

  if (canceled) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Checkout canceled
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          No charges were made. You can return to your resumes and try again
          anytime.
        </p>
        <p className="mt-4">
          <Link href="/resumes" className="text-sm text-blue-600 underline">
            Back to resumes
          </Link>
        </p>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Billing
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Nothing to show here. Open checkout from the resume editor to purchase
          PDF access.
        </p>
        <p className="mt-4">
          <Link href="/resumes" className="text-sm text-blue-600 underline">
            Back to resumes
          </Link>
        </p>
      </div>
    );
  }

  if (pollState === "polling") {
    return (
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Confirming your purchase…
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This usually takes a few seconds while we activate PDF downloads on
          your account.
        </p>
      </div>
    );
  }

  if (pollState === "ready") {
    return (
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          You&apos;re all set
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          PDF downloads are now unlocked. Open a resume and use{" "}
          <strong className="font-medium text-zinc-800 dark:text-zinc-200">
            Download PDF
          </strong>
          .
        </p>
        <p className="mt-4">
          <Link href="/resumes" className="text-sm text-blue-600 underline">
            Back to resumes
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Still processing
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        We couldn&apos;t confirm the update yet. Refresh this page in a moment,
        or check that your Stripe webhook is configured and receiving events.
      </p>
      <p className="mt-4">
        <Link href="/resumes" className="text-sm text-blue-600 underline">
          Back to resumes
        </Link>
      </p>
    </div>
  );
}
