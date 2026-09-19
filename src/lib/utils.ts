// Kept deliberately pure (no fs, no fetch, no cross-file imports) so
// they're trivial to unit test — see tests/utils.test.ts. Node's native
// test runner (`--experimental-strip-types`) requires explicit extensions
// on relative imports, unlike Next.js's bundler, so this file avoids
// importing from sibling modules like `./types` altogether — `as const`
// gets us the same literal-union type without it.

const COURSE_CODE_PATTERN = /^[A-Z]{2,4}\d{3}$/;

// Single source of truth for the four class years — the identity picker,
// the answers API's role check, and the "browse by year" groupings on the
// homepage all read from this instead of repeating the list. Structurally
// identical to the `Role` type in `types.ts` (same four string literals),
// so it's interchangeable with it wherever `Role` is expected.
export const ROLE_ORDER = ["freshman", "sophomore", "junior", "senior"] as const;

export const ROLE_LABEL: Record<(typeof ROLE_ORDER)[number], string> = {
  freshman: "Freshman",
  sophomore: "Sophomore",
  junior: "Junior",
  senior: "Senior",
};

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

// A short, non-exhaustive blocklist of well-known adult-content domains —
// a basic speed bump against casual/lazy abuse (see docs/decisions.md for
// why this isn't meant to be comprehensive). Extend this list, or add
// more patterns, as needed — pair with the admin delete capability
// (DELETE /api/resources/[id]) for anything that slips through.
const BLOCKED_HOSTNAME_PATTERNS: RegExp[] = [
  /(^|\.)pornhub\.com$/i,
  /(^|\.)xvideos\.com$/i,
  /(^|\.)xnxx\.com$/i,
  /(^|\.)xhamster\.com$/i,
  /(^|\.)redtube\.com$/i,
  /(^|\.)youporn\.com$/i,
  /(^|\.)onlyfans\.com$/i,
  /\.xxx$/i,
];

/**
 * True if the URL's hostname matches a known adult-content domain.
 * Malformed URLs return false — the caller's own URL validation (the
 * form's `type="url"` + `required`, and the API route's own checks) is
 * responsible for rejecting those on separate grounds.
 */
export function isBlockedResourceUrl(url: string): boolean {
  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  return BLOCKED_HOSTNAME_PATTERNS.some((pattern) => pattern.test(hostname));
}

// TEMP workaround for an Auth.js v5 (beta) type-augmentation issue where
// session.user.isAdmin isn't recognized by the type checker despite the
// documented module-augmentation pattern in src/lib/auth.d.ts (augmenting
// both "next-auth" and "@auth/core/types") — confirmed via raw `tsc
// --noEmit`, not a Next.js build-wrapper quirk. Runtime behavior is
// correct (the field really is set in the jwt/session callbacks in
// auth.ts); this only satisfies the type checker. Revisit once next-auth
// leaves beta — try removing this and reading session.user.isAdmin
// directly first.
export function isAdminSession(session: unknown): boolean {
  if (!session || typeof session !== "object") return false;
  const user = (session as { user?: unknown }).user;
  if (!user || typeof user !== "object") return false;
  return Boolean((user as { isAdmin?: boolean }).isAdmin);
}
