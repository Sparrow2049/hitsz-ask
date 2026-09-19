"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Course } from "@/lib/types";
import { ROLE_ORDER, ROLE_LABEL } from "@/lib/utils";

export default function QuestionForm({
  courses,
  lockedCourseCode,
}: {
  courses: Course[];
  lockedCourseCode?: string;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [courseCode, setCourseCode] = useState(
    lockedCourseCode ?? courses[0]?.code ?? ""
  );
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 h-24" />
    );
  }

  if (!session?.user) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-4 text-center">
        <p className="text-sm text-text-muted mb-3">
          Sign in to ask a question — this keeps submissions tied to a real
          person instead of anonymous.
        </p>
        <button
          onClick={() => signIn("google")}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-ink hover:opacity-90 transition-opacity"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // No askedBy sent — the server derives it from the signed-in
      // session. See src/app/api/questions/route.ts.
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseCode, title, body }),
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
          {ROLE_ORDER.map((year) => {
            const yearCourses = courses.filter((c) => c.year === year);
            if (yearCourses.length === 0) return null;
            return (
              <optgroup key={year} label={ROLE_LABEL[year]}>
                {yearCourses.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </optgroup>
            );
          })}
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
