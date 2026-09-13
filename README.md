# Waypoint

Get through the semester with people who've already done it.

## What it is

Waypoint is a course-scoped hub for two things freshmen actually need mid-
semester and rarely have a good place to get:

- **Ask a senior** — post a question tied to a course. Students who've
  taken it (or anyone, really) can answer; a senior's answer marks the
  question resolved.
- **Share resources** — notes, past papers, and repo links, organized by
  course instead of scattered across group chats nobody can search.

## Why

Most of what actually helps a freshman survive a hard course already
exists — it's just trapped in a graduated senior's Google Drive, or three
scroll-years deep in a WhatsApp group. Waypoint doesn't try to replace
office hours or Discord. It just gives both of those things a permanent,
searchable, course-shaped home.

## Architecture

The short version: **Ask a senior** and **Share resources** are the same
underlying shape — content scoped to a course — so they share one data
model instead of being built as two separate mini-apps. See
[`docs/architecture.md`](docs/architecture.md) for the full breakdown and
[`docs/decisions.md`](docs/decisions.md) for what we deliberately scoped
out and why (no login system, no database, no file uploads — all
intentional, all explained).

## Project structure

```
waypoint/
├── README.md              ← this file
├── docs/
│   ├── architecture.md    ← components, data flow, the why
│   └── decisions.md       ← what we chose, what we rejected
├── src/
│   ├── app/                ← pages + API routes (Next.js App Router)
│   │   ├── page.tsx           landing page
│   │   ├── courses/[code]/    course hub: resources + questions together
│   │   ├── resources/         all resources, filterable by course
│   │   ├── ask/                all questions, + /ask/[id] thread view
│   │   └── api/                POST endpoints the forms call
│   ├── components/         ← what shows: cards, forms, badges
│   └── lib/                 ← what thinks: types, data layer, pure helpers
├── tests/                  ← unit tests for the pure helpers
├── data/                   ← generated JSON store (gitignored)
└── assets/                 ← screenshots for this README
```

## Where the seed data comes from

The resources in `src/lib/seed.ts` link directly into the real
[HITSZCS](https://github.com/elalamiimed/HITSZCS) repository — an
existing, community-maintained archive of HITSZ CS freshman course
materials. The two seed questions are real questions a freshman actually
has, left unanswered on purpose (a fabricated "senior answer" to "I failed
my placement exam, what do I do" would be actively bad advice — that
needs a real senior). Add courses or resources by extending the arrays in
`seed.ts`; the shape of each entry is documented by `src/lib/types.ts`.
