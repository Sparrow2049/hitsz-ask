# Waypoint

Get through the semester with people who've already done it.

## What it is

Waypoint is a course-scoped hub for things freshmen actually need mid-
semester and rarely have a good place to get.

## Why

Most of what actually helps a freshman survive a hard course already
exists — it's just trapped in a graduated senior's Google Drive, or three
scroll-years deep in a WhatsApp group. Waypoint doesn't try to replace
office hours or Discord. It just gives both of those things a permanent,
searchable, course-shaped home.

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
└── data/                   ← generated JSON store (gitignored)
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
