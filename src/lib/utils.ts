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

/**
 * Turns raw upvotedBy/downvotedBy email arrays (never sent to the
 * client — see Answer.upvotedBy's docstring in types.ts) into what a
 * VoteControl actually needs: counts, plus this viewer's own vote state.
 * Arrays are optional on the underlying type (pre-voting content doesn't
 * have them — readDb() self-heals them to [] on read, but this stays
 * defensive rather than assuming that always ran first). No email (signed
 * out) always means myVote is null — you can't have voted.
 */
export function voteView(
  upvotedBy: string[] | undefined,
  downvotedBy: string[] | undefined,
  email: string | null | undefined
): { upvotes: number; downvotes: number; myVote: "up" | "down" | null } {
  const up = upvotedBy ?? [];
  const down = downvotedBy ?? [];
  const myVote = email ? (up.includes(email) ? "up" : down.includes(email) ? "down" : null) : null;
  return { upvotes: up.length, downvotes: down.length, myVote };
}
export function sortByNewest<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * True once a Study Buddy session's scheduled date+time is in the past.
 * Drives the auto-hide behavior in listStudyGroups — Arthur's call
 * (no toggle, no manual pruning: once it's past, it's just gone from the
 * list). Malformed date/time never counts as past — safer to show
 * something odd than to silently disappear it.
 */
export function isPastSession(
  date: string,
  time: string,
  now: Date = new Date()
): boolean {
  const scheduled = new Date(`${date}T${time}`);
  if (Number.isNaN(scheduled.getTime())) return false;
  return scheduled.getTime() < now.getTime();
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

/**
 * True if the signed-in session is allowed to edit/delete a specific post
 * — either they're an admin (can manage anything, per isAdminSession
 * above), or their verified session email matches the post's stored
 * owner email. `ownerEmail` is undefined for content added before the
 * ownership feature existed, which this correctly treats as "no one but
 * an admin can manage it" rather than trying to guess an owner.
 */
export function canManagePost(
  session: unknown,
  ownerEmail: string | undefined
): boolean {
  if (isAdminSession(session)) return true;
  if (!ownerEmail || !session || typeof session !== "object") return false;
  const user = (session as { user?: unknown }).user;
  if (!user || typeof user !== "object") return false;
  const email = (user as { email?: unknown }).email;
  return typeof email === "string" && email === ownerEmail;
}

const DISPLAY_NAME_MAX_LENGTH = 40;

/**
 * Validates a client-supplied display name override. Returns the trimmed
 * name if it's a non-empty string within the length limit, otherwise null
 * (meaning: caller should fall back to the verified Google name/email).
 *
 * This only ever affects what name is *shown* next to a post — it never
 * touches admin authorization, which stays keyed off the real, verified
 * session email against ADMIN_EMAILS (see isAdminSession above and
 * docs/decisions.md). A signed-in user could in principle set a display
 * name that looks like someone else's — that's a real, accepted tradeoff
 * for letting people not be stuck with their raw Google name, not an
 * oversight. The account behind every post is still the real Google
 * account either way, and admin-delete remains the backstop.
 */
export function sanitizeDisplayName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
    return null;
  }
  return trimmed;
}
