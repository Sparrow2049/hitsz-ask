import { notFound } from "next/navigation";
import Link from "next/link";
import { getQuestion } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatRelativeTime, initials, canManagePost, voteView } from "@/lib/utils";
import AnswerForm from "@/components/AnswerForm";
import QuestionHeader from "@/components/QuestionHeader";
import ReportButton from "@/components/ReportButton";
import VoteControl from "@/components/VoteControl";

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = await getQuestion(id);
  if (!question) notFound();

  const session = await auth();
  const email = session?.user?.email;
  const canManage = canManagePost(session, question.askedByEmail);
  const questionVote = voteView(question.upvotedBy, question.downvotedBy, email);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href={`/courses/${question.courseCode}`}
        className="text-xs text-text-muted hover:text-text"
      >
        ← {question.courseCode}
      </Link>

      <QuestionHeader
        id={question.id}
        title={question.title}
        body={question.body}
        askedBy={question.askedBy}
        createdAt={question.createdAt}
        canManage={canManage}
        upvotes={questionVote.upvotes}
        downvotes={questionVote.downvotes}
        myVote={questionVote.myVote}
      />

      <div className="mt-8 space-y-4">
        <p className="text-sm text-text-muted">
          {question.answers.length}{" "}
          {question.answers.length === 1 ? "answer" : "answers"}
        </p>

        {question.answers.map((a) => {
          const answerVote = voteView(a.upvotedBy, a.downvotedBy, email);
          return (
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
              <div className="mt-2 flex items-center justify-between">
                <VoteControl
                  questionId={question.id}
                  answerId={a.id}
                  upvotes={answerVote.upvotes}
                  downvotes={answerVote.downvotes}
                  myVote={answerVote.myVote}
                />
                <ReportButton targetType="answer" targetId={a.id} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <AnswerForm questionId={question.id} />
      </div>
    </div>
  );
}
