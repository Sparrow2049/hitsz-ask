"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIdentity } from "@/lib/identity";
import { Course, ResourceType } from "@/lib/types";

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
  const { identity } = useIdentity();
  const router = useRouter();

  const [courseCode, setCourseCode] = useState(
    lockedCourseCode ?? courses[0]?.code ?? ""
  );
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ResourceType>("notes");
  const [url, setUrl] = useState("");
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
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode,
          title,
          type,
          url,
          addedBy: identity.name,
        }),
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
            {courses.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
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
