import Link from "next/link";
import type { Metadata } from "next";
import { PublicFooter } from "@/components/marketing/PublicFooter";

export const metadata: Metadata = {
  title: "Privacy Policy — ResumeBlues",
  description: "How ResumeBlues collects, uses, and protects your data.",
};

const h2 =
  "mt-8 text-base font-semibold tracking-tight text-white sm:mt-10 sm:text-lg";
const p = "mt-3 text-sm leading-relaxed text-zinc-400 sm:text-[15px]";
const ul = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-400 sm:text-[15px]";
const contactLink =
  "font-medium text-zinc-200 underline decoration-zinc-600 underline-offset-2 hover:decoration-zinc-400";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className={`${p} mt-4`}>
          ResumeBlues respects your privacy and is committed to protecting your
          information.
        </p>

        <h2 className={h2}>1. Information We Collect</h2>
        <p className={p}>We may collect:</p>
        <ul className={ul}>
          <li>email address</li>
          <li>account login information</li>
          <li>resume content you create</li>
          <li>usage and interaction data</li>
          <li>campaign tracking data (e.g., ad_id)</li>
        </ul>

        <h2 className={h2}>2. How We Use Information</h2>
        <p className={p}>We use your data to:</p>
        <ul className={ul}>
          <li>provide and improve our services</li>
          <li>process payments</li>
          <li>communicate with you</li>
          <li>analyze usage and performance</li>
        </ul>

        <h2 className={h2}>3. Cookies &amp; Tracking</h2>
        <p className={p}>We use cookies and similar technologies to:</p>
        <ul className={ul}>
          <li>remember user sessions</li>
          <li>track campaign performance (e.g., ad_id)</li>
          <li>improve user experience</li>
        </ul>

        <h2 className={h2}>4. Payments</h2>
        <p className={p}>
          Payments are securely processed via Stripe. We do not store full payment
          details on our servers.
        </p>

        <h2 className={h2}>5. Data Sharing</h2>
        <p className={p}>We do not sell your personal data.</p>
        <p className={p}>
          We may share limited data with service providers (e.g., payment processors)
          to operate the service.
        </p>

        <h2 className={h2}>6. Data Security</h2>
        <p className={p}>
          We implement reasonable safeguards to protect your data, but no system is
          100% secure.
        </p>

        <h2 className={h2}>7. Data Retention</h2>
        <p className={p}>
          We retain your data as long as your account is active or as needed to
          provide services.
        </p>

        <h2 className={h2}>8. Your Rights</h2>
        <p className={p}>You may:</p>
        <ul className={ul}>
          <li>request access to your data</li>
          <li>request deletion of your account</li>
        </ul>

        <h2 className={h2}>9. Changes to Policy</h2>
        <p className={p}>
          We may update this Privacy Policy from time to time.
        </p>

        <h2 className={h2}>10. Contact Us</h2>
        <p className={p}>
          If you have any questions about this Privacy Policy, please contact:
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
