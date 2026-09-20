"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useDisplayName } from "@/lib/displayName";
import { Course, ResourceType } from "@/lib/types";
import { ROLE_ORDER, ROLE_LABEL } from "@/lib/utils";

const TYPES: { value: ResourceType; label: string }[] = [
  { value: "notes", label: "Notes" },
  { value: "past-paper", label: "Past paper" },
  { value: "link", label: "Link" },
  { value: "repo", label: "Repo" },
];

export default function ResourceForm({
  courses,
  lockedCourseCode,
}: {
  courses: Course[];
  lockedCourseCode?: string;
}) {
  const { data: session, status } = useSession();
  const { displayName } = useDisplayName();
  const router = useRouter();

  const [courseCode, setCourseCode] = useState(
    lockedCourseCode ?? courses[0]?.code ?? ""
  );
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ResourceType>("notes");
  const [url, setUrl] = useState("");
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
          Sign in to add a resource — this keeps submissions tied to a real
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
      // addedBy still isn't sent — the server always derives the real
      // identity from the signed-in session. displayName is a separate,
      // optional override of what name gets *shown*; the server falls
      // back to the Google name if it's missing or invalid. See
      // src/app/api/resources/route.ts.
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseCode, title, type, url, displayName }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setTitle("");
      setUrl("");
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
      <p className="font-display text-base text-text">Add a resource</p>

      <div className="flex flex-col sm:flex-row gap-3">
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
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ResourceType)}
          className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What is it? e.g. 'Week 1–4 lecture notes'"
        required
        className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Link to it (Drive, GitHub, etc.)"
        type="url"
        required
        className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-ink hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? "Adding…" : "Add resource"}
      </button>
    </form>
  );
}
