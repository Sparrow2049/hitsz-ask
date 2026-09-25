"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useRole } from "@/lib/role";
import { useDisplayName } from "@/lib/displayName";

export default function AnswerForm({ questionId }: { questionId: string }) {
  const { data: session, status } = useSession();
  const { role } = useRole();
  const { displayName } = useDisplayName();
  const router = useRouter();

  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 h-20" />
    );
  }

  if (!session?.user) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-4 text-center">
        <p className="text-sm text-text-muted mb-3">
          Sign in to answer — this keeps answers tied to a real person
          instead of anonymous.
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
      // answeredBy still isn't sent — the server always derives the real
      // identity from the signed-in session. `role` comes from the client
      // since it's a self-declared preference Google can't verify (see
      // src/lib/role.tsx); displayName is likewise an optional, separate
      // override of what name gets *shown* — see src/lib/displayName.tsx.
      const res = await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, role, displayName }),
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
        {role === "senior" ? "Answer this" : "Add to the discussion"}
      </p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={
          role === "senior"
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
