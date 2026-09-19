"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRole } from "@/lib/role";
import { initials, ROLE_ORDER, ROLE_LABEL } from "@/lib/utils";
import { Role } from "@/lib/types";

export default function IdentityBadge() {
  const { data: session, status } = useSession();
  const { role, setRole } = useRole();

  if (status === "loading") {
    // Reserve the space so the header doesn't jump once the session
    // resolves — same idea as the old useSyncExternalStore pattern had
    // for localStorage, just for the async session fetch instead.
    return <div className="h-8 w-32 shrink-0" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn("google")}
        className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink hover:opacity-90 transition-opacity shrink-0"
      >
        Sign in with Google
      </button>
    );
  }

  const name = session.user.name ?? session.user.email ?? "You";

  return (
    <div className="flex items-center gap-2 shrink-0">
      <div
        className="h-8 w-8 rounded-full bg-surface-raised border border-border flex items-center justify-center text-xs text-text"
        title={name}
      >
        {initials(name)}
      </div>
      <div className="text-sm leading-tight hidden sm:block">
        <div className="text-text">{name}</div>
        <div className="text-text-muted">{ROLE_LABEL[role]}</div>
      </div>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        aria-label="Your class year"
        className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {ROLE_ORDER.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABEL[r]}
          </option>
        ))}
      </select>
      <button
        onClick={() => signOut()}
        className="text-xs text-text-muted hover:text-text underline underline-offset-2"
      >
        sign out
      </button>
    </div>
  );
}
