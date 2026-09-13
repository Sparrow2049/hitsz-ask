import { notFound } from "next/navigation";
import { getCourse, getCourses, listResources, listQuestions } from "@/lib/db";
import ResourceCard from "@/components/ResourceCard";
import QuestionCard from "@/components/QuestionCard";
import ResourceForm from "@/components/ResourceForm";
import QuestionForm from "@/components/QuestionForm";
import EmptyState from "@/components/EmptyState";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const course = await getCourse(code);
  if (!course) notFound();

  const resources = await listResources(course.code);
  const questions = await listQuestions(course.code);
  const courses = await getCourses();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <p className="text-sm text-text-muted">{course.code}</p>
      <h1 className="font-display text-3xl text-text">{course.name}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-sm text-text-muted mb-3">
            Resources ({resources.length})
          </h2>
          <div className="space-y-3">
            {resources.length === 0 ? (
              <EmptyState
                title="No resources yet"
                description="Be the first to drop notes or a past paper here."
              />
            ) : (
              resources.map((r) => <ResourceCard key={r.id} resource={r} />)
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
            {questions.length === 0 ? (
              <EmptyState
                title="No questions yet"
                description="Ask what's tripping you up — a senior might already know the answer."
              />
            ) : (
              questions.map((q) => <QuestionCard key={q.id} question={q} />)
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
