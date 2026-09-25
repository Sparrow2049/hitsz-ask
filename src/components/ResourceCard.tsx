"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Resource, ResourceType } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import ReportButton from "./ReportButton";

const TYPE_LABEL: Record<Resource["type"], string> = {
  notes: "Notes",
  "past-paper": "Past paper",
  link: "Link",
  repo: "Repo",
};

const TYPES: { value: ResourceType; label: string }[] = [
  { value: "notes", label: "Notes" },
  { value: "past-paper", label: "Past paper" },
  { value: "link", label: "Link" },
  { value: "repo", label: "Repo" },
];

export default function ResourceCard({
  resource,
  showCourse = false,
  canManage = false,
}: {
  // Callers strip addedByEmail before this reaches the client — see
  // src/lib/utils.ts's canManagePost and every page that renders this
  // card. canManage is computed server-side from that real email (admin
  // OR the original poster) so this component never needs to know it.
  resource: Omit<Resource, "addedByEmail">;
  showCourse?: boolean;
  canManage?: boolean;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Only title/type/url are editable — courseCode isn't, same reasoning
  // as updateResource's docstring in db.ts.
  const [title, setTitle] = useState(resource.title);
  const [type, setType] = useState<ResourceType>(resource.type);
  const [url, setUrl] = useState(resource.url);

  async function handleDelete() {
    if (!confirm(`Delete "${resource.title}"? This can't be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/resources/${resource.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
      setDeleting(false);
    }
  }

  function startEditing() {
    setTitle(resource.title);
    setType(resource.type);
    setUrl(resource.url);
    setError(null);
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/resources/${resource.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, url }),
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

  if (editing) {
    // Edit mode replaces the anchor entirely (not just its contents) — a
    // <form> can't live inside the <a> that wraps the read-only view, and
    // there's no separate "edit page" to route to for resources (they
    // only ever render as cards — see updateResource's docstring), so
    // this is edited in place.
    return (
      <form
        onSubmit={handleSave}
        className="rounded-xl border border-accent/50 bg-surface p-4 space-y-3"
      >
        <div className="flex flex-col sm:flex-row gap-3">
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
          required
          className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          type="url"
          required
          className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
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
    <div className="relative">
      <a
        href={resource.url}
        target="_blank"
        rel="noreferrer"
        className="block rounded-xl border border-border bg-surface p-4 hover:border-accent/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-text leading-snug">{resource.title}</p>
          <span className="shrink-0 rounded-full bg-surface-raised px-2 py-0.5 text-[11px] text-text-muted">
            {TYPE_LABEL[resource.type]}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
          {showCourse && (
            <>
              <span className="text-text">{resource.courseCode}</span>
              <span aria-hidden>·</span>
            </>
          )}
          <span>added by {resource.addedBy}</span>
          <span aria-hidden>·</span>
          <span>{formatRelativeTime(resource.createdAt)}</span>
        </div>
      </a>
      <div className="mt-1.5 flex justify-end">
        <ReportButton targetType="resource" targetId={resource.id} />
      </div>
      {canManage && (
        <div className="absolute -top-2 -right-2 flex gap-1">
          <button
            onClick={startEditing}
            aria-label="Edit this resource"
            title="Edit this resource"
            className="h-6 w-6 rounded-full bg-surface border border-border flex items-center justify-center text-xs text-text-muted hover:text-text hover:border-accent transition-colors"
          >
            ✎
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Delete this resource"
            title="Delete this resource"
            className="h-6 w-6 rounded-full bg-surface border border-border flex items-center justify-center text-xs text-text-muted hover:text-red-400 hover:border-red-400 transition-colors disabled:opacity-50"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
