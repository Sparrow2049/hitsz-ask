"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRelativeTime } from "@/lib/utils";
import ReportButton from "./ReportButton";
import VoteControl from "./VoteControl";

// This is where editing a question lives — not on QuestionCard. Compact
// cards don't show the full body anyway, and this page already had the
// title/body/meta-row markup rendered inline (not via QuestionCard — see
// the previous checkpoint's notes on why), so folding edit in here means
// title, body, and the delete/report/vote actions all toggle together
// instead of being split across components with independent state.
export default function QuestionHeader({
  id,
  title: initialTitle,
  body: initialBody,
  askedBy,
  createdAt,
  canManage,
  upvotes,
  downvotes,
  myVote,
}: {
  id: string;
  title: string;
  body: string;
  askedBy: string;
  createdAt: string;
  canManage: boolean;
  upvotes: number;
  downvotes: number;
  myVote: "up" | "down" | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Only title/body are editable — see updateQuestion's docstring in
  // db.ts for why courseCode/resolved aren't.
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);

  function startEditing() {
    setTitle(initialTitle);
    setBody(initialBody);
    setError(null);
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${initialTitle}"? This can't be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      // This page IS the question that just got deleted — nothing to
      // refresh into, so send them back to the list.
      router.push("/ask");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="mt-2 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 font-display text-xl text-text focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={4}
          className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={saving}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-text-muted hover:bg-surface-raised transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      <h1 className="mt-2 font-display text-2xl text-text leading-snug">
        {initialTitle}
      </h1>
      <p className="mt-3 text-text-muted whitespace-pre-wrap">{initialBody}</p>
      <div className="mt-3">
        <VoteControl questionId={id} upvotes={upvotes} downvotes={downvotes} myVote={myVote} />
      </div>
      <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <span>
          asked by {askedBy} · {formatRelativeTime(createdAt)}
        </span>
        <span aria-hidden>·</span>
        <ReportButton targetType="question" targetId={id} />
        {canManage && (
          <>
            <span aria-hidden>·</span>
            <button
              onClick={startEditing}
              className="hover:text-text transition-colors"
            >
              Edit
            </button>
            <span aria-hidden>·</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="hover:text-red-400 transition-colors disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </>
        )}
      </p>
    </>
  );
}
