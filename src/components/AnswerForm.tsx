"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIdentity } from "@/lib/identity";

export default function AnswerForm({ questionId }: { questionId: string }) {
  const { identity } = useIdentity();
  const router = useRouter();

  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identity) {
      setError("Set your name up in the header first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          answeredBy: identity.name,
          role: identity.role,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-surface p-4 space-y-3"
    >
      <p className="font-display text-base text-text">
        {identity?.role === "senior"
          ? "Answer this"
          : "Add to the discussion"}
      </p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={
          identity?.role === "senior"
            ? "Share what worked when you took this course…"
            : "Ask a follow-up, or add what you've already tried…"
        }
        required
        rows={3}
        className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-ink hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? "Posting…" : "Post"}
      </button>
    </form>
  );
}
