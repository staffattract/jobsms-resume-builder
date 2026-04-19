import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getResumeForCurrentUser } from "@/lib/resume/queries";
import { ResumeEditorShell } from "@/components/resume/ResumeEditorShell";

type Props = { params: Promise<{ resumeId: string }> };

export default async function ResumeEditorPage({ params }: Props) {
  const { resumeId } = await params;
  const resume = await getResumeForCurrentUser(resumeId);
  if (!resume) {
    notFound();
  }

  if (!resume.content.meta.templateSelectionComplete) {
    redirect(`/resumes/${resumeId}/template`);
  }

  return (
    <div className="mx-auto max-w-[1600px] rounded-2xl bg-gradient-to-b from-zinc-100/80 to-zinc-50/50 px-4 py-6 dark:from-zinc-950 dark:to-zinc-950 sm:px-6 sm:py-8">
      <p className="mb-6">
        <Link
          href="/resumes"
          className="text-sm font-semibold text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to resumes
        </Link>
      </p>
      <ResumeEditorShell
        resumeId={resume.id}
        initialTitle={resume.title}
        initialContent={resume.content}
      />
    </div>
  );
}
