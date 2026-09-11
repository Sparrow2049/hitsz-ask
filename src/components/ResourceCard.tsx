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
  return (
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
  );
}
