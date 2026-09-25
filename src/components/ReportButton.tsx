"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { ReportTargetType } from "@/lib/types";

export default function ReportButton({
  targetType,
  targetId,
}: {
  targetType: ReportTargetType;
  targetId: string;
}) {
  const { data: session } = useSession();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleReport(e: React.MouseEvent) {
    // Several call sites nest this inside a clickable card (an <a> or
    // <Link> wrapping the whole card) — stop the click from also
    // triggering that outer navigation.
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      signIn("google");
      return;
    }
    const reason = prompt("What's wrong with this?");
    if (!reason?.trim()) return;

    setPending(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setDone(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return <span className="text-[11px] text-text-muted">Reported</span>;
  }

  return (
    <button
      onClick={handleReport}
      disabled={pending}
      className="text-[11px] text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
    >
      {pending ? "…" : "Report"}
    </button>
  );
}
