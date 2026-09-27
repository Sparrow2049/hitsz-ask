# Waypoint

Get through the semester with people who've already done it.

## What it is

Waypoint is a course-scoped hub for two things freshmen actually need mid-
semester and rarely have a good place to get.

There are functions like "Ask a senior", "Share a resource" and "Study buddy".

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
materials.
