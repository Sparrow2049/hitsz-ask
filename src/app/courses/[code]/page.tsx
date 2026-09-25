import { notFound } from "next/navigation";
import { getCourse, getCourses, listResources, listQuestions } from "@/lib/db";
import { auth } from "@/lib/auth";
import ResourceCard from "@/components/ResourceCard";
import QuestionCard from "@/components/QuestionCard";
import ResourceForm from "@/components/ResourceForm";
import QuestionForm from "@/components/QuestionForm";
import EmptyState from "@/components/EmptyState";
import { ROLE_LABEL, canManagePost, voteView } from "@/lib/utils";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const course = await getCourse(code);
  if (!course) notFound();

  const session = await auth();
  const email = session?.user?.email;
  const resources = await listResources(course.code);
  const questions = await listQuestions(course.code);
  const courses = await getCourses();

  // Strip the real email before it reaches any "use client" component —
  // props passed from a server to a client component are visible in the
  // page's payload, so this can't just be left in and ignored by the UI.
  // canManage is the only thing derived from it that the client needs.
  const resourcesView = resources.map(({ addedByEmail, ...r }) => ({
    ...r,
    canManage: canManagePost(session, addedByEmail),
  }));
  const questionsView = questions.map(
    ({ askedByEmail, upvotedBy, downvotedBy, ...q }) => ({
      ...q,
      canManage: canManagePost(session, askedByEmail),
      ...voteView(upvotedBy, downvotedBy, email),
    })
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <p className="text-sm text-text-muted">
        {course.code} · {ROLE_LABEL[course.year]}
      </p>
      <h1 className="font-display text-3xl text-text">{course.name}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-sm text-text-muted mb-3">
            Resources ({resources.length})
          </h2>
          <div className="space-y-3">
            {resourcesView.length === 0 ? (
              <EmptyState
                title="No resources yet"
                description="Be the first to drop notes or a past paper here."
              />
            ) : (
              resourcesView.map((r) => (
                <ResourceCard key={r.id} resource={r} canManage={r.canManage} />
              ))
            )}
          </div>
          <div className="mt-4">
            <ResourceForm courses={courses} lockedCourseCode={course.code} />
          </div>
        </section>

        <section>
          <h2 className="text-sm text-text-muted mb-3">
            Questions ({questions.length})
          </h2>
          <div className="space-y-3">
            {questionsView.length === 0 ? (
              <EmptyState
                title="No questions yet"
                description="Ask what's tripping you up — a senior might already know the answer."
              />
            ) : (
              questionsView.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  canManage={q.canManage}
                  upvotes={q.upvotes}
                  downvotes={q.downvotes}
                  myVote={q.myVote}
                />
              ))
            )}
          </div>
          <div className="mt-4">
            <QuestionForm courses={courses} lockedCourseCode={course.code} />
          </div>
        </section>
      </div>
    </div>
  );
}
