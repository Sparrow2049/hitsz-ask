"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIdentity } from "@/lib/identity";
import { Course } from "@/lib/types";

export default function QuestionForm({
  courses,
  lockedCourseCode,
}: {
  courses: Course[];
  lockedCourseCode?: string;
}) {
  const { identity } = useIdentity();
  const router = useRouter();

  const [courseCode, setCourseCode] = useState(
    lockedCourseCode ?? courses[0]?.code ?? ""
  );
  const [title, setTitle] = useState("");
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
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode,
          title,
          body,
          askedBy: identity.name,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setTitle("");
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
      <p className="font-display text-base text-text">Ask a senior</p>

      {!lockedCourseCode && (
        <select
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {courses.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>
      )}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Your question, in one line"
        required
        className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add context — what have you tried, where are you stuck?"
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
        {submitting ? "Posting…" : "Post question"}
      </button>
    </form>
  );
}
