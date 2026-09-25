"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Question } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import ReportButton from "./ReportButton";
import VoteControl from "./VoteControl";

export default function QuestionCard({
  question,
  showCourse = false,
  canManage = false,
  upvotes,
  downvotes,
  myVote,
}: {
  // Callers strip askedByEmail AND the raw upvotedBy/downvotedBy arrays
  // before this reaches the client — see src/lib/utils.ts's
  // canManagePost/voteView and every page that renders this card.
  question: Omit<Question, "askedByEmail" | "upvotedBy" | "downvotedBy">;
  showCourse?: boolean;
  canManage?: boolean;
  upvotes: number;
  downvotes: number;
  myVote: "up" | "down" | null;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${question.title}"? This can't be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/questions/${question.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
      setDeleting(false);
    }
  }

  return (
    <div className="relative">
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
      <div className="mt-1.5 flex items-center justify-between">
        <VoteControl
          questionId={question.id}
          upvotes={upvotes}
          downvotes={downvotes}
          myVote={myVote}
        />
        <ReportButton targetType="question" targetId={question.id} />
      </div>
      {canManage && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete this question"
          title="Delete this question"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-surface border border-border flex items-center justify-center text-xs text-text-muted hover:text-red-400 hover:border-red-400 transition-colors disabled:opacity-50"
        >
          ✕
        </button>
      )}
    </div>
  );
}
