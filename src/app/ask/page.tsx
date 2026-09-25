import { getCourses, listQuestions } from "@/lib/db";
import { auth } from "@/lib/auth";
import QuestionCard from "@/components/QuestionCard";
import QuestionForm from "@/components/QuestionForm";
import EmptyState from "@/components/EmptyState";
import CourseFilterRow from "@/components/CourseFilterRow";
import SearchBar from "@/components/SearchBar";
import { canManagePost, voteView } from "@/lib/utils";

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; query?: string }>;
}) {
  const { course, query } = await searchParams;
  const session = await auth();
  const email = session?.user?.email;
  const courses = await getCourses();
  const questions = await listQuestions(course, query);
  const questionsView = questions.map(
    ({ askedByEmail, upvotedBy, downvotedBy, ...q }) => ({
      ...q,
      canManage: canManagePost(session, askedByEmail),
      ...voteView(upvotedBy, downvotedBy, email),
    })
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-text">Ask a senior</h1>
      <p className="mt-1.5 text-text-muted">
        Post a question tied to your course. Seniors who&apos;ve taken it
        can answer directly.
      </p>

      <div className="mt-6">
        <SearchBar placeholder="Search questions by course, title, or keyword…" />
      </div>

      <div className="mt-4">
        <CourseFilterRow
          courses={courses}
          basePath="/ask"
          selected={course}
          query={query}
        />
      </div>

      <div className="mt-6 space-y-3">
        {questions.length === 0 ? (
          <EmptyState
            title={query ? `No matches for "${query}"` : "No questions yet"}
            description={
              query
                ? "Try a different course, title, or keyword."
                : "Ask what's tripping you up for this course."
            }
          />
        ) : (
          questionsView.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              showCourse={!course}
              canManage={q.canManage}
              upvotes={q.upvotes}
              downvotes={q.downvotes}
              myVote={q.myVote}
            />
          ))
        )}
      </div>

      <div className="mt-6">
        <QuestionForm courses={courses} lockedCourseCode={course} />
      </div>
    </div>
  );
}
