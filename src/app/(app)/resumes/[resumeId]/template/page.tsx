import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ResumeTemplateStartClient } from "@/components/resume/ResumeTemplateStartClient";
import { getResumeForCurrentUser } from "@/lib/resume/queries";

type Props = {
  params: Promise<{ resumeId: string }>;
  searchParams: Promise<{ change?: string | string[] }>;
};

export default async function ResumeTemplatePage({ params, searchParams }: Props) {
  const { resumeId } = await params;
  const sp = await searchParams;
  const changeRaw = sp.change;
  const change =
    changeRaw === "1" ||
    changeRaw === "true" ||
    (Array.isArray(changeRaw) && changeRaw.includes("1"));

  const resume = await getResumeForCurrentUser(resumeId);
  if (!resume) {
    notFound();
  }

  if (resume.content.meta.templateSelectionComplete && !change) {
    redirect(`/resumes/${resumeId}`);
  }

  return (
    <div className="mx-auto max-w-[1600px] rounded-2xl bg-gradient-to-b from-zinc-100/80 to-zinc-50/50 px-4 py-8 dark:from-zinc-950 dark:to-zinc-950 sm:px-6 sm:py-10">
      <p className="mb-6">
        <Link
          href={change ? `/resumes/${resumeId}` : "/resumes"}
          className="text-sm font-semibold text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          {change ? "← Back to editor" : "← Back to resumes"}
        </Link>
      </p>
      <ResumeTemplateStartClient
        resumeId={resume.id}
        mode={change ? "change" : "pick"}
      />
    </div>
  );
}
