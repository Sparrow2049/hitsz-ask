import { getCourses, listQuestions } from "@/lib/db";
import QuestionCard from "@/components/QuestionCard";
import QuestionForm from "@/components/QuestionForm";
import EmptyState from "@/components/EmptyState";
import CourseFilterRow from "@/components/CourseFilterRow";

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const { course } = await searchParams;
  const courses = await getCourses();
  const questions = await listQuestions(course);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-text">Ask a senior</h1>
      <p className="mt-1.5 text-text-muted">
        Post a question tied to your course. Seniors who&apos;ve taken it
        can answer directly.
      </p>

      <div className="mt-6">
        <CourseFilterRow courses={courses} basePath="/ask" selected={course} />
      </div>

      <div className="mt-6 space-y-3">
        {questions.length === 0 ? (
          <EmptyState
            title="No questions yet"
            description="Ask what's tripping you up for this course."
          />
        ) : (
          questions.map((q) => (
            <QuestionCard key={q.id} question={q} showCourse={!course} />
          ))
        )}
      </div>

      <div className="mt-6">
        <QuestionForm courses={courses} lockedCourseCode={course} />
      </div>
    </div>
  );
}
