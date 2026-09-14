import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@libsql/client";
import { DbShape, Course, Resource, Question, Answer, Role } from "./types";
import { seedData } from "./seed";
import { matchesSearch } from "./utils";

// --- Two storage modes, one interface ---
//
// Local dev: a JSON file on disk. Zero setup, works offline, easy to read.
//
// Production (Vercel): Vercel's filesystem is read-only outside of a
// per-invocation temp folder, so a local JSON file can't persist writes
// there. When TURSO_DATABASE_URL is set (i.e. you're deployed and configured
// it), we store the exact same JSON blob as one row in a hosted SQLite
// database instead — same data shape, same functions below, just a
// different place to read/write it. See docs/decisions.md.

const DB_PATH = path.join(process.cwd(), "data", "db.json");
const useTurso = Boolean(process.env.TURSO_DATABASE_URL);

const tursoClient = useTurso
  ? createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  : null;

let tableReady: Promise<void> | null = null;
function ensureTursoTable(): Promise<void> {
  if (!tursoClient) return Promise.resolve();
  if (!tableReady) {
    tableReady = tursoClient
      .execute(
        `CREATE TABLE IF NOT EXISTS store (id TEXT PRIMARY KEY, data TEXT NOT NULL)`
      )
      .then(() => undefined);
  }
  return tableReady;
}

function ensureLocalFile(): void {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(seedData, null, 2));
  }
}

async function readDb(): Promise<DbShape> {
  if (tursoClient) {
    await ensureTursoTable();
    const result = await tursoClient.execute(
      "SELECT data FROM store WHERE id = 'main'"
    );
    if (result.rows.length === 0) {
      await writeDb(seedData);
      return seedData;
    }
    return JSON.parse(result.rows[0].data as string) as DbShape;
  }
  ensureLocalFile();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw) as DbShape;
}

async function writeDb(db: DbShape): Promise<void> {
  if (tursoClient) {
    await ensureTursoTable();
    await tursoClient.execute({
      sql: "INSERT INTO store (id, data) VALUES ('main', ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data",
      args: [JSON.stringify(db)],
    });
    return;
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// ---- courses ----

export async function getCourses(): Promise<Course[]> {
  return (await readDb()).courses;
}

export async function getCourse(code: string): Promise<Course | undefined> {
  return (await readDb()).courses.find((c) => c.code === code.toUpperCase());
}

// One-time, idempotent migration for when the seed data schema evolves
// after a Turso store already has real data in it. readDb() only ever
// seeds a *brand new* store (see above) — it has no way to know the seed
// data changed shape on an existing deployment, so new/changed seed
// entries silently never reach production without something like this.
// Purely additive: never removes or overwrites anything, including real
// user-submitted resources/questions. Safe to call more than once — the
// second call is a no-op.
export async function migrateSeedCourses(): Promise<{
  coursesAdded: string[];
  yearsBackfilled: string[];
  resourcesAdded: string[];
}> {
  const db = await readDb();
  const coursesAdded: string[] = [];
  const yearsBackfilled: string[] = [];
  const resourcesAdded: string[] = [];

  // Backfill `year` on courses persisted before that field existed.
  for (const course of db.courses) {
    if (!course.year) {
      const seedMatch = seedData.courses.find((c) => c.code === course.code);
      if (seedMatch) {
        course.year = seedMatch.year;
        yearsBackfilled.push(course.code);
      }
    }
  }

  // Add seed courses that don't exist in the store yet.
  const existingCourseCodes = new Set(db.courses.map((c) => c.code));
  for (const seedCourse of seedData.courses) {
    if (!existingCourseCodes.has(seedCourse.code)) {
      db.courses.push(seedCourse);
      coursesAdded.push(seedCourse.code);
    }
  }

  // Add seed resources that don't exist in the store yet.
  const existingResourceIds = new Set(db.resources.map((r) => r.id));
  for (const seedResource of seedData.resources) {
    if (!existingResourceIds.has(seedResource.id)) {
      db.resources.push(seedResource);
      resourcesAdded.push(seedResource.id);
    }
  }

  if (
    coursesAdded.length ||
    yearsBackfilled.length ||
    resourcesAdded.length
  ) {
    await writeDb(db);
  }

  return { coursesAdded, yearsBackfilled, resourcesAdded };
}

// ---- resources ----

export async function listResources(
  courseCode?: string,
  query?: string
): Promise<Resource[]> {
  const { resources, courses } = await readDb();
  const courseNameByCode = new Map(courses.map((c) => [c.code, c.name]));

  const filtered = resources
    .filter((r) => !courseCode || r.courseCode === courseCode.toUpperCase())
    .filter((r) =>
      matchesSearch(query, [r.title, r.courseCode, courseNameByCode.get(r.courseCode)])
    );
  return [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addResource(input: {
  courseCode: string;
  title: string;
  type: Resource["type"];
  url: string;
  addedBy: string;
}): Promise<Resource> {
  const db = await readDb();
  const resource: Resource = {
    id: randomUUID(),
    courseCode: input.courseCode.toUpperCase(),
    title: input.title.trim(),
    type: input.type,
    url: input.url.trim(),
    addedBy: input.addedBy.trim() || "Anonymous",
    createdAt: new Date().toISOString(),
  };
  db.resources.push(resource);
  await writeDb(db);
  return resource;
}

// ---- questions + answers ----

export async function listQuestions(
  courseCode?: string,
  query?: string
): Promise<Question[]> {
  const { questions, courses } = await readDb();
  const courseNameByCode = new Map(courses.map((c) => [c.code, c.name]));

  const filtered = questions
    .filter((q) => !courseCode || q.courseCode === courseCode.toUpperCase())
    .filter((q) =>
      matchesSearch(query, [
        q.title,
        q.body,
        q.courseCode,
        courseNameByCode.get(q.courseCode),
      ])
    );
  return [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getQuestion(id: string): Promise<Question | undefined> {
  return (await readDb()).questions.find((q) => q.id === id);
}

export async function addQuestion(input: {
  courseCode: string;
  title: string;
  body: string;
  askedBy: string;
}): Promise<Question> {
  const db = await readDb();
  const question: Question = {
    id: randomUUID(),
    courseCode: input.courseCode.toUpperCase(),
    title: input.title.trim(),
    body: input.body.trim(),
    askedBy: input.askedBy.trim() || "Anonymous",
    resolved: false,
    createdAt: new Date().toISOString(),
    answers: [],
  };
  db.questions.push(question);
  await writeDb(db);
  return question;
}

export async function addAnswer(
  questionId: string,
  input: { body: string; answeredBy: string; role: Role }
): Promise<Answer | undefined> {
  const db = await readDb();
  const question = db.questions.find((q) => q.id === questionId);
  if (!question) return undefined;

  const answer: Answer = {
    id: randomUUID(),
    questionId,
    body: input.body.trim(),
    answeredBy: input.answeredBy.trim() || "Anonymous",
    role: input.role,
    createdAt: new Date().toISOString(),
  };
  question.answers.push(answer);
  // A senior answering marks the question resolved — that's the whole
  // point of the feature, so we treat it as a real state change, not a
  // manual checkbox someone forgets to tick.
  if (input.role === "senior") question.resolved = true;
  await writeDb(db);
  return answer;
}
