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

## Screenshots

*(Replace these with real screenshots before submitting — judges only see
the repo and these images, not a live demo.)*

| Home | Course hub | Ask a senior |
|---|---|---|
| `assets/home.png` | `assets/course-hub.png` | `assets/ask-thread.png` |

See `assets/README.md` for the exact shots worth taking.

## Setup

Requires Node 20+ (uses Node's built-in test runner + native TypeScript
support — Node 22+ recommended).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first request
seeds `data/db.json` from `src/lib/seed.ts` automatically — nothing else
to configure, no database, no accounts.

```bash
npm test         # runs the unit tests in tests/
npm run build    # production build, also type-checks everything
```

## Try it in under a minute

1. Open the app, set a name in the header, and pick a role (**Freshman** or
   **Senior**) — this is just a display label, not a real account.
2. Go to a course hub, e.g. `/courses/MATH100` (Pre-Calculus).
3. As a freshman: ask a question, or drop a link under "Add a resource."
4. Switch your role to **Senior** (click *edit* in the header) and answer
   the question you just asked — watch it flip to "Answered by a senior."

## Deploying it for real (Vercel)

Local dev needs none of this — it's only for a live, publicly-reachable
deployment.

The app works on Vercel out of the box for browsing. To make "Add a
resource" and "Ask a senior" actually save once deployed (Vercel's
production filesystem can't persist a local JSON file — see
`docs/decisions.md`), set these two environment variables in your Vercel
project's Settings → Environment Variables, from a free
[Turso](https://turso.tech) database:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

Without them, the site still works — it just resets to the seed data on
every deploy instead of saving new submissions.

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
