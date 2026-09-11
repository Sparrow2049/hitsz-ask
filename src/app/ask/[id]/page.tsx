import { notFound } from "next/navigation";
import Link from "next/link";
import { getQuestion } from "@/lib/db";
import { formatRelativeTime, initials } from "@/lib/utils";
import AnswerForm from "@/components/AnswerForm";

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = await getQuestion(id);
  if (!question) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href={`/courses/${question.courseCode}`}
        className="text-xs text-text-muted hover:text-text"
      >
        ← {question.courseCode}
      </Link>

      <h1 className="mt-2 font-display text-2xl text-text leading-snug">
        {question.title}
      </h1>
      <p className="mt-3 text-text-muted whitespace-pre-wrap">
        {question.body}
      </p>
      <p className="mt-4 text-xs text-text-muted">
        asked by {question.askedBy} · {formatRelativeTime(question.createdAt)}
      </p>

      <div className="mt-8 space-y-4">
        <p className="text-sm text-text-muted">
          {question.answers.length}{" "}
          {question.answers.length === 1 ? "answer" : "answers"}
        </p>

        {question.answers.map((a) => (
          <div
            key={a.id}
            className={`rounded-xl border p-4 ${
              a.role === "senior"
                ? "border-senior/40 bg-senior/5"
                : "border-border bg-surface"
            }`}
          >
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <div className="h-6 w-6 rounded-full bg-surface-raised border border-border flex items-center justify-center text-[10px] text-text">
                {initials(a.answeredBy)}
              </div>
              <span className="text-text">{a.answeredBy}</span>
              {a.role === "senior" && (
                <span className="rounded-full bg-senior/15 px-2 py-0.5 text-[11px] text-senior">
                  Senior
                </span>
              )}
              <span aria-hidden>·</span>
              <span>{formatRelativeTime(a.createdAt)}</span>
            </div>
            <p className="mt-2 text-text whitespace-pre-wrap">{a.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <AnswerForm questionId={question.id} />
      </div>
    </div>
  );
}
