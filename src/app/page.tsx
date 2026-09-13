import Link from "next/link";
import { getCourses, listQuestions, listResources } from "@/lib/db";
import CourseBadge from "@/components/CourseBadge";
import { ROLE_ORDER, ROLE_LABEL } from "@/lib/utils";

export default async function HomePage() {
  const courses = await getCourses();
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

      <div className="mt-14">
        <p className="text-sm text-text-muted mb-3">Browse by course</p>
        <div className="space-y-5">
          {ROLE_ORDER.map((year) => {
            const yearCourses = courses.filter((c) => c.year === year);
            return (
              <div key={year}>
                <p className="text-xs text-text-muted mb-2">
                  {ROLE_LABEL[year]}
                </p>
                {yearCourses.length === 0 ? (
                  <p className="text-xs text-text-muted italic">
                    Soon to be added
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {yearCourses.map((c) => (
                      <CourseBadge key={c.code} course={c} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
