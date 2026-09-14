import Link from "next/link";
import { listQuestions, listResources } from "@/lib/db";

export default async function HomePage() {
  const questionCount = (await listQuestions()).length;
  const resourceCount = (await listResources()).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <h1 className="font-display text-4xl sm:text-5xl leading-tight text-text max-w-xl">
        Get through the semester with people who&apos;ve done it
      </h1>
      <p className="mt-4 max-w-md text-text-muted">
        Two tools, one place: ask the students who already survived a
        course, and find the notes and past papers they used to do it.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/ask"
          className="rounded-xl border border-border bg-surface p-6 hover:border-accent/50 transition-colors"
        >
          <p className="font-display text-xl text-text">Ask a senior</p>
          <p className="mt-1.5 text-sm text-text-muted">
            Post a question tied to your course. Seniors who&apos;ve taken
            it can answer directly.
          </p>
          <p className="mt-4 text-xs text-text-muted">
            {questionCount} question{questionCount === 1 ? "" : "s"} so far
          </p>
        </Link>

        <Link
          href="/resources"
          className="rounded-xl border border-border bg-surface p-6 hover:border-accent/50 transition-colors"
        >
          <p className="font-display text-xl text-text">Share resources</p>
          <p className="mt-1.5 text-sm text-text-muted">
            Notes, past papers, and repos, organized by course instead of
            buried in a chat history.
          </p>
          <p className="mt-4 text-xs text-text-muted">
            {resourceCount} resource{resourceCount === 1 ? "" : "s"} so far
          </p>
        </Link>
      </div>
    </div>
  );
}
