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

## Chose: a one-time migration route over always-merge-on-read

When sophomore/junior courses were added, the existing Turso store on
production already had data in it — `readDb()` only seeds a *brand new*
store, so the updated `seed.ts` had no way to reach the live site on its
own. The alternative was to make every read reconcile the stored data
against `seedData` automatically, but that risks silently re-adding a
course or resource that someone deliberately changed or removed later. A
one-off `/api/admin/migrate` route, run once by hand and then deleted,
keeps that risk at zero: it merges in anything missing from `seedData`
exactly once, touches nothing else, and doesn't linger as standing
behavior.

## Chose: Google sign-in (Auth.js) to gate writes, not reads

Anyone could `POST` directly to the API and add anything — the client-side
"type your name" identity had zero verification behind it. Auth.js
(`next-auth` v5) with the Google provider replaces that: signing in is
required to add a resource, ask a question, or post an answer, and the
submitting name/email is now taken from the verified session
server-side — never trusted from the request body, closing the exact gap
that made login worth adding in the first place. Browsing stays public;
only writes are gated, since the goal was stopping anonymous abuse, not
locking out casual visitors.

Two things this does *not* do, worth remembering: it doesn't verify
someone is actually a HITSZ student — any Google account works, by
design, given most real users are in mainland China and a
school-domain-only or non-Google approach would've been more locked-down
but was explicitly not what was asked for. And `role`
(freshman/sophomore/junior/senior) stays self-declared — Google has no
way to verify that, so the "Senior" answer highlight is about who *says*
they're a senior, not a verified fact. Login buys accountability and a
much higher bar than anonymous drive-by spam, not a guarantee.

## Chose: a domain blocklist for resource links, paired with admin delete

A request to keep 18+ sites from being added as resources. A hardcoded
domain blocklist (`isBlockedResourceUrl` in `utils.ts`) is a real
mitigation but not a complete one — it only catches known domains, and
anything routed through a URL shortener or a lesser-known site slips
through untouched. Building or paying for a real URL-categorization
service was overkill for this app's size. The blocklist is the first
line of defense; `DELETE /api/resources/[id]` (admin-only, gated on
`ADMIN_EMAILS`) is the backstop for whatever gets through — before this,
there was no way to remove *anything* once posted, regardless of how it
got there, which was arguably the bigger gap.
