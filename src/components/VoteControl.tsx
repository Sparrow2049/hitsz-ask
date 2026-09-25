"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

export default function VoteControl({
  questionId,
  answerId,
  upvotes,
  downvotes,
  myVote,
}: {
  questionId: string;
  // Omit when voting on the question itself; set when voting on one of
  // its answers — see voteOnQuestion/voteOnAnswer in db.ts.
  answerId?: string;
  upvotes: number;
  downvotes: number;
  myVote: "up" | "down" | null;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const score = upvotes - downvotes;
  const endpoint = answerId
    ? `/api/questions/${questionId}/answers/${answerId}/vote`
    : `/api/questions/${questionId}/vote`;

  async function handleVote(direction: "up" | "down", e: React.MouseEvent) {
    // Several call sites nest this inside a clickable card (an <a> or
    // <Link> wrapping the whole card) — stop the click from also
    // triggering that outer navigation, same as ReportButton.
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      signIn("google");
      return;
    }
    setPending(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => handleVote("up", e)}
        disabled={pending}
        aria-label="Upvote"
        aria-pressed={myVote === "up"}
        className={`h-6 w-6 rounded flex items-center justify-center text-sm leading-none transition-colors disabled:opacity-50 ${
          myVote === "up" ? "text-accent" : "text-text-muted hover:text-text"
        }`}
      >
        ▲
      </button>
      <span className="min-w-[1.5rem] text-center text-xs text-text-muted tabular-nums">
        {score}
      </span>
      <button
        onClick={(e) => handleVote("down", e)}
        disabled={pending}
        aria-label="Downvote"
        aria-pressed={myVote === "down"}
        className={`h-6 w-6 rounded flex items-center justify-center text-sm leading-none transition-colors disabled:opacity-50 ${
          myVote === "down" ? "text-red-400" : "text-text-muted hover:text-text"
        }`}
      >
        ▼
      </button>
    </div>
  );
}
