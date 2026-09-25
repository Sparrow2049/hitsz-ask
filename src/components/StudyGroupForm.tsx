"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useDisplayName } from "@/lib/displayName";

const DEFAULT_MAX_JOINERS = 6;

export default function StudyGroupForm() {
  const { data: session, status } = useSession();
  const { displayName } = useDisplayName();
  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [maxJoiners, setMaxJoiners] = useState(DEFAULT_MAX_JOINERS);
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
          Sign in to start a study session — this keeps it tied to a real
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
      // createdBy still isn't sent — the server always derives the real
      // identity from the signed-in session, same discipline as every
      // other form here. See src/app/api/study-groups/route.ts.
      const res = await fetch("/api/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          description,
          date,
          time,
          place,
          maxJoiners,
          displayName,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setTopic("");
      setDescription("");
      setDate("");
      setTime("");
      setPlace("");
      setMaxJoiners(DEFAULT_MAX_JOINERS);
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
      <p className="font-display text-base text-text">Start a study session</p>

      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="What are you studying? e.g. 'Midterm review — Chapters 3–5'"
        required
        className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add context — what to bring, what to expect (optional)"
        rows={2}
        className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={date}
          onChange={(e) => setDate(e.target.value)}
          type="date"
          required
          className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          type="time"
          required
          className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <input
        value={place}
        onChange={(e) => setPlace(e.target.value)}
        placeholder="Where? e.g. 'Library, 3rd floor'"
        required
        className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />

      <label className="flex items-center gap-2 text-sm text-text-muted">
        Max people
        <input
          value={maxJoiners}
          onChange={(e) => setMaxJoiners(Number(e.target.value))}
          type="number"
          min={2}
          max={100}
          required
          className="w-20 rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-ink hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? "Posting…" : "Start session"}
      </button>
    </form>
  );
}
