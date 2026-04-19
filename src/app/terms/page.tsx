import Link from "next/link";
import type { Metadata } from "next";
import { PublicFooter } from "@/components/marketing/PublicFooter";

export const metadata: Metadata = {
  title: "Terms & Conditions — ResumeBlues",
  description: "Terms of use for ResumeBlues.",
};

const h2 =
  "mt-8 text-base font-semibold tracking-tight text-white sm:mt-10 sm:text-lg";
const p = "mt-3 text-sm leading-relaxed text-zinc-400 sm:text-[15px]";
const ul = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-400 sm:text-[15px]";
const contactLink =
  "font-medium text-zinc-200 underline decoration-zinc-600 underline-offset-2 hover:decoration-zinc-400";
const h3 =
  "mt-6 text-sm font-semibold tracking-tight text-white sm:mt-7 sm:text-base";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-black via-zinc-950 to-zinc-950 font-sans text-zinc-100 antialiased">
      <header className="shrink-0 border-b border-zinc-800/90 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-400 transition hover:text-white"
          >
            ← Home
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-white"
          >
            ResumeBlues
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Terms &amp; Conditions
        </h1>
        <p className={`${p} mt-4`}>
          Welcome to ResumeBlues. By using our website and services, you agree to the
          following terms.
        </p>

        <h2 className={h2}>1. Service Description</h2>
        <p className={p}>
          ResumeBlues provides an online resume-building platform that allows users
          to create, edit, and download resumes.
        </p>

        <h2 className={h2}>2. User Accounts</h2>
        <p className={p}>
          You are responsible for maintaining the confidentiality of your account
          credentials and for all activity under your account.
        </p>

        <h2 className={h2}>3. Payments &amp; Subscriptions</h2>
        <ul className={ul}>
          <li>Payments are processed securely via Stripe.</li>
          <li>Certain features (including PDF downloads) require a paid subscription.</li>
          <li>Subscriptions may renew automatically unless canceled.</li>
          <li>You are responsible for managing your billing and cancellation.</li>
        </ul>

        <h3 className={h3}>Subscription &amp; Cancellation</h3>
        <p className={p}>
          You may cancel your subscription at any time through your account settings
          or billing portal. Cancellation will stop future billing but does not
          retroactively refund payments already made. You will continue to have access
          to paid features until the end of your current billing period.
        </p>

        <h3 className={h3}>Refund Policy</h3>
        <p className={p}>
          All payments are final unless otherwise required by law. If you believe you
          were charged in error, please contact{" "}
          <a href="mailto:support@resumeblues.com" className={contactLink}>
            support@resumeblues.com
          </a>
          .
        </p>

        <h2 className={h2}>4. No Guarantees</h2>
        <p className={p}>
          We do not guarantee job placement, interview success, or employment outcomes
          from using our service.
        </p>

        <h2 className={h2}>5. Acceptable Use</h2>
        <p className={p}>You agree not to:</p>
        <ul className={ul}>
          <li>use the service for unlawful purposes</li>
          <li>upload harmful or misleading content</li>
          <li>attempt to interfere with the platform</li>
        </ul>

        <h2 className={h2}>6. Intellectual Property</h2>
        <p className={p}>
          All platform content, design, and functionality are owned by ResumeBlues and
          may not be copied or reused without permission.
        </p>

        <h2 className={h2}>7. Limitation of Liability</h2>
        <p className={p}>
          ResumeBlues is provided &quot;as is.&quot; We are not liable for:
        </p>
        <ul className={ul}>
          <li>loss of data</li>
          <li>business or employment outcomes</li>
          <li>interruptions or technical issues</li>
        </ul>

        <h2 className={h2}>8. Termination</h2>
        <p className={p}>
          We reserve the right to suspend or terminate accounts that violate these
          terms.
        </p>

        <h2 className={h2}>9. Changes to Terms</h2>
        <p className={p}>
          We may update these Terms at any time. Continued use of the service
          constitutes acceptance of changes.
        </p>

        <h2 className={h2}>10. Contact Information</h2>
        <p className={p}>
          If you have any questions about these Terms &amp; Conditions, please contact:
        </p>
        <p className={`${p} mt-2`}>
          <a href="mailto:support@resumeblues.com" className={contactLink}>
            support@resumeblues.com
          </a>
        </p>
      </main>

      <PublicFooter />
    </div>
  );
}
