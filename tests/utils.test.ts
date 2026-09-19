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
