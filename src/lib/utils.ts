// Kept deliberately pure (no fs, no fetch) so they're trivial to unit test —
// see tests/utils.test.ts.

const COURSE_CODE_PATTERN = /^[A-Z]{2,4}\d{3}$/;

/** e.g. "cs201" -> true, "cs2" -> false, "history" -> false */
export function isValidCourseCode(code: string): boolean {
  return COURSE_CODE_PATTERN.test(code.trim().toUpperCase());
}

/** Turns an ISO timestamp into "just now" / "3h ago" / "5d ago" style text. */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diffMs = now.getTime() - then;
  const minutes = Math.floor(diffMs / (60 * 1000));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

/** Newest-first, stable for equal timestamps. */
export function sortByNewest<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Case-insensitive substring match against any of the given fields. An
 * empty/whitespace-only query always matches (so callers can pipe an
 * optional `?query=` search param straight in without an extra branch).
 */
export function matchesSearch(
  query: string | undefined,
  fields: (string | undefined)[]
): boolean {
  const needle = query?.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((field) => field?.toLowerCase().includes(needle));
}
