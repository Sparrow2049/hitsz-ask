"use client";

import { useState } from "react";
import { useIdentity } from "@/lib/identity";
import { initials, ROLE_ORDER, ROLE_LABEL } from "@/lib/utils";
import { Role } from "@/lib/types";

export default function IdentityBadge() {
  const { identity, setIdentity, clearIdentity } = useIdentity();
  const [editing, setEditing] = useState(false);

  if (!identity || editing) {
    return (
      <QuickForm
        initial={identity}
        onCancel={identity ? () => setEditing(false) : undefined}
        onSave={(next) => {
          setIdentity(next);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <div
        className="h-8 w-8 rounded-full bg-surface-raised border border-border flex items-center justify-center text-xs text-text"
        title={identity.name}
      >
        {initials(identity.name)}
      </div>
      <div className="text-sm leading-tight hidden sm:block">
        <div className="text-text">{identity.name}</div>
        <div className="text-text-muted capitalize">{identity.role}</div>
      </div>
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-text-muted hover:text-text underline underline-offset-2 ml-1"
      >
        edit
      </button>
      <button
        onClick={clearIdentity}
        className="text-xs text-text-muted hover:text-text underline underline-offset-2"
      >
        sign out
      </button>
    </div>
  );
}

function QuickForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: { name: string; role: Role } | null;
  onSave: (identity: { name: string; role: Role }) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState<Role>(initial?.role ?? "freshman");

  function submit() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), role });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-center gap-2 shrink-0"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-28 rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {ROLE_ORDER.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABEL[r]}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink hover:opacity-90 transition-opacity"
      >
        Save
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-text-muted hover:text-text"
        >
          cancel
        </button>
      )}
    </form>
  );
}
