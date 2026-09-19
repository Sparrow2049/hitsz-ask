"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { isAdminSession } from "@/lib/utils";
import { Resource } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

const TYPE_LABEL: Record<Resource["type"], string> = {
  notes: "Notes",
  "past-paper": "Past paper",
  link: "Link",
  repo: "Repo",
};

export default function ResourceCard({
  resource,
  showCourse = false,
}: {
  resource: Resource;
  showCourse?: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

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
      {isAdminSession(session) && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete this resource"
          title="Delete this resource"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-surface border border-border flex items-center justify-center text-xs text-text-muted hover:text-red-400 hover:border-red-400 transition-colors disabled:opacity-50"
        >
          ✕
        </button>
      )}
    </div>
  );
}
