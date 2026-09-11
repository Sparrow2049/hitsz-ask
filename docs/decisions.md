# Decisions

Rule 8 says judges care whether it's *thoughtful*, not just whether it
works. This file is the paper trail: every scope cut below was deliberate,
not something we ran out of time for and hoped nobody would ask about.

## Chose: two features, not four

The brief said pick what matters. We picked **Ask a senior** and **Share
resources** because they answer the two moments freshmen actually get
stuck: "I don't understand this" and "I can't find the notes." Study-buddy
matching and study-together tooling are real needs too, but they're
scheduling/social problems, not survive-the-course problems — a smaller,
sharper app beats a shallow four-in-one.

## Chose: one JSON file over a database

**Rejected (at first):** Prisma + SQLite, Supabase/Postgres.

A real database is the "correct" answer for a growing app. It's the wrong
answer for a few-day hackathon judged on whether every teammate can
explain every line (rule 3): a database means a schema migration step, a
generated client, and infrastructure neither of us needs to debug at 1am.
`lib/db.ts` reads and writes one JSON file with plain `fs` calls — every
line is something a first-year CS student can read start to finish.

**Amendment, once we deployed to Vercel:** Vercel's production filesystem
is read-only outside a temp folder, so the JSON file approach silently
stops persisting writes once deployed — the app loads fine, but nothing
you submit is actually saved. Rather than replace the JSON approach
entirely, `lib/db.ts` now supports two backends behind the exact same
functions: the local file when developing, and a hosted SQLite database
(Turso, via `@libsql/client`) when a `TURSO_DATABASE_URL` environment
variable is present. We picked Turso specifically because it's a pure-JS
client with no native binary to download — the same problem that ruled
out Prisma in the first place. Local development still needs zero setup;
only a production deploy needs the extra environment variables.

## Chose: no login system

**Rejected:** NextAuth, Clerk, a real accounts table.

Judging is screenshots, not a live session (rule 5) — there's no account to
protect and no state that needs to survive a server restart on someone
else's laptop. You set a name and a role once; it's saved in your browser.
This isn't "auth we didn't get to," it's auth we decided the problem
doesn't need yet. If this became a real product, `lib/identity.tsx` is the
one file that would need to change.

## Chose: a senior's answer auto-resolves the question

We could have added a manual "mark as resolved" checkbox. We didn't — a
senior answering *is* the resolution. One less state for a stressed
freshman to manage, and it means the "Answered by a senior" badge on
`/ask` is always trustworthy, not something someone forgot to tick.

## Chose: resources are links, not uploads

**Rejected:** file upload + storage.

"Keep it simple," the brief said for this feature specifically. Almost
everything students actually share — Drive folders, GitHub repos, past
papers already hosted somewhere — is already a link. Building file storage
would have spent a day of the timeline on infrastructure the actual
feature doesn't need.

## Chose: Node's built-in test runner over Vitest/Jest

Node 22 can run TypeScript directly (`--experimental-strip-types`) and has
`node:test` built in — so `npm test` needed zero new dependencies. Three
real tests on the pure helper functions beat zero tests on a more
"standard" but heavier setup we didn't have time to fight with (rule:
"three tests beat zero tests").
