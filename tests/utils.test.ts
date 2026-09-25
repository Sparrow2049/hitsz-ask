import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isValidCourseCode,
  formatRelativeTime,
  sortByNewest,
  initials,
  matchesSearch,
  isBlockedResourceUrl,
  isAdminSession,
  sanitizeDisplayName,
  canManagePost,
  isPastSession,
  voteView,
} from "../src/lib/utils.ts";

test("isValidCourseCode accepts real-shaped codes, rejects junk", () => {
  assert.equal(isValidCourseCode("CS201"), true);
  assert.equal(isValidCourseCode("cs201"), true, "should be case-insensitive");
  assert.equal(isValidCourseCode("CS2"), false, "too short a number part");
  assert.equal(isValidCourseCode("HISTORY"), false, "no digits at all");
  assert.equal(isValidCourseCode(""), false);
});

test("formatRelativeTime buckets sensibly", () => {
  const now = new Date("2026-09-08T12:00:00.000Z");
  assert.equal(
    formatRelativeTime(new Date("2026-09-08T11:59:30.000Z").toISOString(), now),
    "just now"
  );
  assert.equal(
    formatRelativeTime(new Date("2026-09-08T09:00:00.000Z").toISOString(), now),
    "3h ago"
  );
  assert.equal(
    formatRelativeTime(new Date("2026-09-05T12:00:00.000Z").toISOString(), now),
    "3d ago"
  );
});

test("sortByNewest orders descending without mutating the input", () => {
  const items = [
    { id: "a", createdAt: "2026-01-01T00:00:00.000Z" },
    { id: "b", createdAt: "2026-03-01T00:00:00.000Z" },
    { id: "c", createdAt: "2026-02-01T00:00:00.000Z" },
  ];
  const sorted = sortByNewest(items);
  assert.deepEqual(
    sorted.map((i) => i.id),
    ["b", "c", "a"]
  );
  assert.equal(items[0].id, "a", "original array must not be mutated");
});

test("initials handles one word, two words, and empty input", () => {
  assert.equal(initials("Wei Chen"), "WC");
  assert.equal(initials("Cher"), "CH");
  assert.equal(initials("   "), "?");
});

test("matchesSearch is case-insensitive across fields, and empty query matches everything", () => {
  const fields = ["Linear Algebra", "MATH102", undefined];
  assert.equal(matchesSearch("algebra", fields), true);
  assert.equal(matchesSearch("MATH102", fields), true, "should be case-insensitive");
  assert.equal(matchesSearch("physics", fields), false);
  assert.equal(matchesSearch(undefined, fields), true, "no query = no filtering");
  assert.equal(matchesSearch("   ", fields), true, "whitespace-only query = no filtering");
});

test("isBlockedResourceUrl catches known adult domains, subdomains, and .xxx, but not lookalikes or malformed URLs", () => {
  assert.equal(isBlockedResourceUrl("https://pornhub.com/whatever"), true);
  assert.equal(
    isBlockedResourceUrl("https://www.pornhub.com/whatever"),
    true,
    "subdomains should match too"
  );
  assert.equal(isBlockedResourceUrl("https://something.xxx"), true, ".xxx TLD");
  assert.equal(
    isBlockedResourceUrl("https://notpornhub.com/whatever"),
    false,
    "must match the domain exactly, not just contain the substring"
  );
  assert.equal(
    isBlockedResourceUrl("https://drive.google.com/folder/123"),
    false
  );
  assert.equal(isBlockedResourceUrl("not a url at all"), false, "malformed URL");
});

test("isAdminSession only trusts a truthy session.user.isAdmin, and never throws on garbage input", () => {
  assert.equal(
    isAdminSession({ user: { isAdmin: true, name: "Arthur" } }),
    true
  );
  assert.equal(
    isAdminSession({ user: { isAdmin: false, name: "Someone" } }),
    false,
    "signed in but not on ADMIN_EMAILS"
  );
  assert.equal(isAdminSession({ user: {} }), false, "isAdmin missing entirely");
  assert.equal(isAdminSession(null), false, "signed out session");
  assert.equal(isAdminSession(undefined), false);
  assert.equal(isAdminSession({}), false, "session with no user at all");
  assert.equal(
    isAdminSession({ user: null }),
    false,
    "user explicitly null shouldn't throw"
  );
  assert.equal(
    isAdminSession("not even an object"),
    false,
    "garbage input shouldn't throw"
  );
});

test("sanitizeDisplayName trims, enforces bounds, and rejects non-strings", () => {
  assert.equal(sanitizeDisplayName("  Wei Chen  "), "Wei Chen", "trims whitespace");
  assert.equal(sanitizeDisplayName(""), null, "empty string");
  assert.equal(sanitizeDisplayName("   "), null, "whitespace-only");
  assert.equal(sanitizeDisplayName(null), null);
  assert.equal(sanitizeDisplayName(undefined), null);
  assert.equal(sanitizeDisplayName(42), null, "non-string input shouldn't throw");
  assert.equal(sanitizeDisplayName("a".repeat(40)), "a".repeat(40), "exactly at the limit is fine");
  assert.equal(sanitizeDisplayName("a".repeat(41)), null, "one over the limit is rejected");
});

test("canManagePost allows admins on anything, and owners only on their own", () => {
  const admin = { user: { email: "admin@example.com", isAdmin: true } };
  const owner = { user: { email: "owner@example.com", isAdmin: false } };
  const stranger = { user: { email: "stranger@example.com", isAdmin: false } };

  assert.equal(canManagePost(admin, "owner@example.com"), true, "admin can manage anyone's post");
  assert.equal(canManagePost(admin, undefined), true, "admin can manage even ownerless legacy posts");
  assert.equal(canManagePost(owner, "owner@example.com"), true, "matching email");
  assert.equal(canManagePost(stranger, "owner@example.com"), false, "different email");
  assert.equal(canManagePost(owner, undefined), false, "no owner on record — not even the claimed owner can self-manage it");
  assert.equal(canManagePost(null, "owner@example.com"), false, "signed out");
  assert.equal(canManagePost({}, "owner@example.com"), false, "session with no user");
});

test("isPastSession compares scheduled date+time against now, and never throws on garbage input", () => {
  const now = new Date("2026-09-23T12:00:00.000Z");
  assert.equal(
    isPastSession("2026-09-20", "10:00", now),
    true,
    "a few days before now"
  );
  assert.equal(
    isPastSession("2026-09-23", "11:59", now),
    true,
    "earlier the same day"
  );
  assert.equal(
    isPastSession("2026-09-23", "12:01", now),
    false,
    "later the same day"
  );
  assert.equal(
    isPastSession("2026-10-01", "09:00", now),
    false,
    "a future date"
  );
  assert.equal(
    isPastSession("not-a-date", "10:00", now),
    false,
    "malformed input should never count as past"
  );
});

test("voteView turns raw vote arrays into counts + this viewer's own vote state", () => {
  const upvotedBy = ["alice@example.com", "bob@example.com"];
  const downvotedBy = ["carol@example.com"];

  assert.deepEqual(
    voteView(upvotedBy, downvotedBy, "alice@example.com"),
    { upvotes: 2, downvotes: 1, myVote: "up" },
    "a voter in upvotedBy"
  );
  assert.deepEqual(
    voteView(upvotedBy, downvotedBy, "carol@example.com"),
    { upvotes: 2, downvotes: 1, myVote: "down" },
    "a voter in downvotedBy"
  );
  assert.deepEqual(
    voteView(upvotedBy, downvotedBy, "dave@example.com"),
    { upvotes: 2, downvotes: 1, myVote: null },
    "signed in but hasn't voted"
  );
  assert.deepEqual(
    voteView(upvotedBy, downvotedBy, null),
    { upvotes: 2, downvotes: 1, myVote: null },
    "signed out — can't have voted, regardless of the arrays"
  );
  assert.deepEqual(
    voteView(undefined, undefined, "alice@example.com"),
    { upvotes: 0, downvotes: 0, myVote: null },
    "pre-voting content with no arrays at all yet"
  );
});
