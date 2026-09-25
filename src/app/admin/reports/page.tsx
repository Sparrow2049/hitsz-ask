import { notFound } from "next/navigation";
import Link from "next/link";
import { listReports } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isAdminSession, formatRelativeTime } from "@/lib/utils";
import { ReportTargetType } from "@/lib/types";
import EmptyState from "@/components/EmptyState";
import DismissReportButton from "@/components/DismissReportButton";

const TARGET_LABEL: Record<ReportTargetType, string> = {
  resource: "Resource",
  question: "Question",
  answer: "Answer",
};

// Admin-only — deliberately not in the header nav (see docs/decisions.md's
// "surfaced somewhere only Arthur sees"). notFound() for anyone else,
// rather than a "you're not allowed" message, so the page's existence
// isn't hinted at either.
export default async function AdminReportsPage() {
  const session = await auth();
  if (!isAdminSession(session)) notFound();

  const reports = await listReports();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-text">Reports</h1>
      <p className="mt-1.5 text-text-muted">
        Flagged resources, questions, and answers. Dismissing just clears the
        report — it doesn&apos;t touch the content itself.
      </p>

      <div className="mt-6 space-y-3">
        {reports.length === 0 ? (
          <EmptyState title="No open reports" description="Nothing's been flagged." />
        ) : (
          reports.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="shrink-0 rounded-full bg-surface-raised px-2 py-0.5 text-[11px] text-text-muted">
                  {TARGET_LABEL[r.targetType]}
                </span>
                <span className="text-xs text-text-muted">
                  {formatRelativeTime(r.createdAt)}
                </span>
              </div>

              <p className="mt-2 text-sm text-text-muted italic">
                &ldquo;{r.targetSnapshot}&rdquo;
              </p>
              <p className="mt-2 text-text">{r.reason}</p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted">
                <span>
                  reported by {r.reportedBy} ({r.reportedByEmail})
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href={r.targetHref}
                    className="text-accent hover:underline"
                  >
                    View content →
                  </Link>
                  <DismissReportButton reportId={r.id} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
