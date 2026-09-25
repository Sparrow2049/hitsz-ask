"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DismissReportButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [dismissing, setDismissing] = useState(false);

  async function handleDismiss() {
    setDismissing(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
      setDismissing(false);
    }
  }

  return (
    <button
      onClick={handleDismiss}
      disabled={dismissing}
      className="rounded-md border border-border px-3 py-1.5 text-sm text-text-muted hover:text-text hover:bg-surface-raised transition-colors disabled:opacity-50"
    >
      {dismissing ? "…" : "Dismiss"}
    </button>
  );
}
