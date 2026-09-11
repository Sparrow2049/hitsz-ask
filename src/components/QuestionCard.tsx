import Link from "next/link";
import { Question } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

export default function QuestionCard({
  question,
  showCourse = false,
}: {
  question: Question;
  showCourse?: boolean;
}) {
  return (
    <Link
      href={`/ask/${question.id}`}
      className="block rounded-xl border border-border bg-surface p-4 hover:border-accent/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-text leading-snug">{question.title}</p>
        {question.resolved ? (
          <span className="shrink-0 rounded-full bg-senior/15 px-2 py-0.5 text-[11px] text-senior">
            Answered by a senior
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-surface-raised px-2 py-0.5 text-[11px] text-text-muted">
            Open
          </span>
        )}
      </div>
      <p className="mt-1.5 line-clamp-2 text-sm text-text-muted">
        {question.body}
      </p>
      <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
        {showCourse && (
          <>
            <span className="text-text">{question.courseCode}</span>
            <span aria-hidden>·</span>
          </>
        )}
        <span>asked by {question.askedBy}</span>
        <span aria-hidden>·</span>
        <span>{formatRelativeTime(question.createdAt)}</span>
        <span aria-hidden>·</span>
        <span>
          {question.answers.length}{" "}
          {question.answers.length === 1 ? "answer" : "answers"}
        </span>
      </div>
    </Link>
  );
}
