"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { StudyGroup } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

export default function StudyGroupCard({
  studyGroup,
  joinedCount,
  hasJoined,
  canManage = false,
}: {
  // Callers strip createdByEmail and the raw joinedBy email list before
  // this reaches the client — same discipline as ResourceCard/QuestionCard
  // (see src/lib/utils.ts's canManagePost). joinedCount/hasJoined are the
  // only join-state info the client ever sees.
  studyGroup: Omit<StudyGroup, "createdByEmail" | "joinedBy">;
  joinedCount: number;
  hasJoined: boolean;
  canManage?: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const full = !hasJoined && joinedCount >= studyGroup.maxJoiners;

  async function handleJoinToggle() {
    if (!session?.user) {
      signIn("google");
      return;
    }
    setPending(true);
    try {
      const res = await fetch(`/api/study-groups/${studyGroup.id}/join`, {
        method: hasJoined ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  async function handleCancel() {
    if (!confirm(`Cancel "${studyGroup.topic}"? This can't be undone.`)) return;
    setPending(true);
    try {
      const res = await fetch(`/api/study-groups/${studyGroup.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
      setPending(false);
    }
  }

  return (
    <div className="relative rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-text leading-snug">{studyGroup.topic}</p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${
            full
              ? "bg-surface-raised text-text-muted"
              : "bg-senior/15 text-senior"
          }`}
        >
          {joinedCount}/{studyGroup.maxJoiners} joined
        </span>
      </div>

      {studyGroup.description && (
        <p className="mt-1.5 line-clamp-2 text-sm text-text-muted">
          {studyGroup.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <span className="text-text">
          {studyGroup.date} · {studyGroup.time}
        </span>
        <span aria-hidden>·</span>
        <span>{studyGroup.place}</span>
        <span aria-hidden>·</span>
        <span>started by {studyGroup.createdBy}</span>
        <span aria-hidden>·</span>
        <span>{formatRelativeTime(studyGroup.createdAt)}</span>
      </div>

      <div className="mt-3">
        <button
          onClick={handleJoinToggle}
          disabled={pending || (full && !hasJoined)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-opacity disabled:opacity-50 ${
            hasJoined
              ? "border border-border text-text hover:bg-surface-raised"
              : "bg-accent text-accent-ink hover:opacity-90"
          }`}
        >
          {pending ? "…" : full && !hasJoined ? "Full" : hasJoined ? "Leave" : "Join"}
        </button>
      </div>

      {canManage && (
        <button
          onClick={handleCancel}
          disabled={pending}
          aria-label="Cancel this session"
          title="Cancel this session"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-surface border border-border flex items-center justify-center text-xs text-text-muted hover:text-red-400 hover:border-red-400 transition-colors disabled:opacity-50"
        >
          ✕
        </button>
      )}
    </div>
  );
}
