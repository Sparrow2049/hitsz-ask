"use client";

import { useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Debounced so typing doesn't trigger a server round-trip on every
// keystroke — the page is a Server Component, so each URL update re-runs
// listResources()/listQuestions() against the data store.
const DEBOUNCE_MS = 300;

export default function SearchBar({
  placeholder = "Search by course, title, or keyword…",
}: {
  placeholder?: string;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(term: string) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Build off the current params so an active course filter (or any
      // other param) survives a search, and vice versa.
      const params = new URLSearchParams(searchParams);
      if (term.trim()) {
        params.set("query", term.trim());
      } else {
        params.delete("query");
      }
      router.replace(`${pathname}?${params.toString()}`);
    }, DEBOUNCE_MS);
  }

  return (
    <input
      type="text"
      defaultValue={searchParams.get("query") ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      aria-label="Search"
      className="w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
    />
  );
}
