import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@libsql/client";
import { DbShape, Course, Resource, Question, Answer, Role, StudyGroup, Report, VoteDirection } from "./types";
import { seedData } from "./seed";
import { matchesSearch, isPastSession, sortByNewest } from "./utils";

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
  const db = await readDbFromStore();
  // studyGroups is a brand new top-level field — unlike migrateSeedCourses's
  // job, there's no seed data to reconcile against, it just needs to exist
  // as an array so every function below can safely push/filter it, even
  // against a store written before this feature existed.
  if (!db.studyGroups) db.studyGroups = [];
  if (!db.reports) db.reports = [];
  // Same self-healing reasoning as studyGroups/reports above, but these
  // fields live on individual questions/answers rather than at the top
  // level, since voting was added after they already existed (see
  // Answer.upvotedBy's docstring in types.ts).
  for (const question of db.questions) {
    if (!question.upvotedBy) question.upvotedBy = [];
    if (!question.downvotedBy) question.downvotedBy = [];
    for (const answer of question.answers) {
      if (!answer.upvotedBy) answer.upvotedBy = [];
      if (!answer.downvotedBy) answer.downvotedBy = [];
    }
  }
  return db;
}

async function readDbFromStore(): Promise<DbShape> {
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
  addedByEmail: string;
}): Promise<Resource> {
  const db = await readDb();
  const resource: Resource = {
    id: randomUUID(),
    courseCode: input.courseCode.toUpperCase(),
    title: input.title.trim(),
    type: input.type,
    url: input.url.trim(),
    addedBy: input.addedBy.trim() || "Anonymous",
    addedByEmail: input.addedByEmail,
    createdAt: new Date().toISOString(),
  };
  db.resources.push(resource);
  await writeDb(db);
  return resource;
}

export async function getResource(id: string): Promise<Resource | undefined> {
  return (await readDb()).resources.find((r) => r.id === id);
}

/** For the /my-posts page — resources whose addedByEmail matches. Resources from before this feature existed have no addedByEmail and never match. */
export async function listResourcesByEmail(email: string): Promise<Resource[]> {
  const { resources } = await readDb();
  return resources
    .filter((r) => r.addedByEmail === email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Callable by an admin OR the resource's original poster — see DELETE /api/resources/[id]. Returns false if no such resource. */
export async function deleteResource(id: string): Promise<boolean> {
  const db = await readDb();
  const index = db.resources.findIndex((r) => r.id === id);
  if (index === -1) return false;
  db.resources.splice(index, 1);
  await writeDb(db);
  return true;
}

/**
 * Callable by an admin OR the resource's original poster — see PATCH
 * /api/resources/[id]. Only title/type/url are editable — courseCode is
 * deliberately left out, same reasoning as updateQuestion below: changing
 * it re-categorizes the post rather than correcting its content, and
 * that's a bigger structural move than "edit" implies here. Returns
 * undefined if no such resource.
 */
export async function updateResource(
  id: string,
  updates: { title: string; type: Resource["type"]; url: string }
): Promise<Resource | undefined> {
  const db = await readDb();
  const resource = db.resources.find((r) => r.id === id);
  if (!resource) return undefined;
  resource.title = updates.title.trim();
  resource.type = updates.type;
  resource.url = updates.url.trim();
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
  askedByEmail: string;
}): Promise<Question> {
  const db = await readDb();
  const question: Question = {
    id: randomUUID(),
    courseCode: input.courseCode.toUpperCase(),
    title: input.title.trim(),
    body: input.body.trim(),
    askedBy: input.askedBy.trim() || "Anonymous",
    askedByEmail: input.askedByEmail,
    resolved: false,
    createdAt: new Date().toISOString(),
    answers: [],
    upvotedBy: [],
    downvotedBy: [],
  };
  db.questions.push(question);
  await writeDb(db);
  return question;
}

/** For the /my-posts page — questions whose askedByEmail matches. Questions from before this feature existed have no askedByEmail and never match. */
export async function listQuestionsByEmail(email: string): Promise<Question[]> {
  const { questions } = await readDb();
  return questions
    .filter((q) => q.askedByEmail === email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
    upvotedBy: [],
    downvotedBy: [],
  };
  question.answers.push(answer);
  // A senior answering marks the question resolved — that's the whole
  // point of the feature, so we treat it as a real state change, not a
  // manual checkbox someone forgets to tick.
  if (input.role === "senior") question.resolved = true;
  await writeDb(db);
  return answer;
}

/**
 * Shared toggle logic for voteOnQuestion/voteOnAnswer — mutates the
 * passed-in question or answer's vote arrays in place. Same three-way
 * toggle Reddit uses: voting the same direction again removes your vote,
 * voting the other direction switches it, you're only ever in one of
 * upvotedBy/downvotedBy at a time. Returns the resulting vote state
 * (null once removed).
 */
function applyVote(
  target: { upvotedBy: string[]; downvotedBy: string[] },
  email: string,
  direction: VoteDirection
): VoteDirection | null {
  const upIndex = target.upvotedBy.indexOf(email);
  const downIndex = target.downvotedBy.indexOf(email);

  if (direction === "up") {
    if (upIndex !== -1) {
      target.upvotedBy.splice(upIndex, 1);
      return null;
    }
    if (downIndex !== -1) target.downvotedBy.splice(downIndex, 1);
    target.upvotedBy.push(email);
    return "up";
  }
  if (downIndex !== -1) {
    target.downvotedBy.splice(downIndex, 1);
    return null;
  }
  if (upIndex !== -1) target.upvotedBy.splice(upIndex, 1);
  target.downvotedBy.push(email);
  return "down";
}

export type VoteResult = { upvotes: number; downvotes: number; myVote: VoteDirection | null };

/** Callable by any signed-in user — see POST /api/questions/[id]/vote. Returns undefined if no such question. */
export async function voteOnQuestion(
  id: string,
  email: string,
  direction: VoteDirection
): Promise<VoteResult | undefined> {
  const db = await readDb();
  const question = db.questions.find((q) => q.id === id);
  if (!question) return undefined;
  // readDb()'s self-healing loop guarantees these are already arrays —
  // the fallback assignment here is just defensive belt-and-braces, and
  // lets TypeScript treat them as definitely-arrays (not optional) for
  // the rest of this function, matching the type staying optional only
  // to accommodate seed.ts's older literals (see Answer.upvotedBy's
  // docstring in types.ts).
  const upvotedBy = question.upvotedBy ?? (question.upvotedBy = []);
  const downvotedBy = question.downvotedBy ?? (question.downvotedBy = []);
  const myVote = applyVote({ upvotedBy, downvotedBy }, email, direction);
  await writeDb(db);
  return { upvotes: upvotedBy.length, downvotes: downvotedBy.length, myVote };
}

/** Callable by any signed-in user — see POST /api/questions/[id]/answers/[answerId]/vote. Returns undefined if no such question or answer. */
export async function voteOnAnswer(
  questionId: string,
  answerId: string,
  email: string,
  direction: VoteDirection
): Promise<VoteResult | undefined> {
  const db = await readDb();
  const question = db.questions.find((q) => q.id === questionId);
  const answer = question?.answers.find((a) => a.id === answerId);
  if (!answer) return undefined;
  const upvotedBy = answer.upvotedBy ?? (answer.upvotedBy = []);
  const downvotedBy = answer.downvotedBy ?? (answer.downvotedBy = []);
  const myVote = applyVote({ upvotedBy, downvotedBy }, email, direction);
  await writeDb(db);
  return { upvotes: upvotedBy.length, downvotes: downvotedBy.length, myVote };
}

/** Callable by an admin OR the question's original asker — see DELETE /api/questions/[id]. Removes its answers too (they're embedded). Returns false if no such question. */
export async function deleteQuestion(id: string): Promise<boolean> {
  const db = await readDb();
  const index = db.questions.findIndex((q) => q.id === id);
  if (index === -1) return false;
  db.questions.splice(index, 1);
  await writeDb(db);
  return true;
}

/**
 * Callable by an admin OR the question's original asker — see PATCH
 * /api/questions/[id]. Only title/body are editable — courseCode and
 * resolved are deliberately left out: courseCode re-categorizes the post
 * rather than correcting it, and resolved isn't something this feature
 * touches at all (it's read off whether a senior has answered, not a
 * manually-set field). Answers aren't touched either. Returns undefined
 * if no such question.
 */
export async function updateQuestion(
  id: string,
  updates: { title: string; body: string }
): Promise<Question | undefined> {
  const db = await readDb();
  const question = db.questions.find((q) => q.id === id);
  if (!question) return undefined;
  question.title = updates.title.trim();
  question.body = updates.body.trim();
  await writeDb(db);
  return question;
}

/**
 * Answers aren't a top-level array — they're embedded in their question
 * (see Question.answers) — so unlike getResource/getQuestion there's no
 * single-array lookup for one. This is the one place that searches across
 * every question's answers to find one by id, used by the report route
 * to validate/snapshot an answer being flagged.
 */
export async function findAnswer(
  id: string
): Promise<{ answer: Answer; question: Question } | undefined> {
  const { questions } = await readDb();
  for (const question of questions) {
    const answer = question.answers.find((a) => a.id === id);
    if (answer) return { answer, question };
  }
  return undefined;
}

// ---- study groups ----

/**
 * Upcoming sessions only — past ones auto-hide (Arthur's call: no toggle,
 * no manual pruning). Sorted soonest-first, since for something you'd
 * actually go to, "what's happening next" matters more than "what was
 * posted most recently" (the sort order every other list here uses).
 */
export async function listStudyGroups(query?: string): Promise<StudyGroup[]> {
  const { studyGroups } = await readDb();
  const now = new Date();
  const filtered = studyGroups
    .filter((g) => !isPastSession(g.date, g.time, now))
    .filter((g) => matchesSearch(query, [g.topic, g.description, g.place]));
  return [...filtered].sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
  );
}

export async function getStudyGroup(id: string): Promise<StudyGroup | undefined> {
  return (await readDb()).studyGroups.find((g) => g.id === id);
}

/**
 * For /my-posts — every session the user created, regardless of date.
 * Unlike listStudyGroups (the public /study listing), this deliberately
 * does NOT auto-hide past ones — /my-posts is a record of what you've
 * posted, same as it is for resources/questions, neither of which has
 * any "expired" concept to filter on either.
 */
export async function listStudyGroupsByEmail(email: string): Promise<StudyGroup[]> {
  const { studyGroups } = await readDb();
  return studyGroups
    .filter((g) => g.createdByEmail === email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addStudyGroup(input: {
  topic: string;
  description: string;
  date: string;
  time: string;
  place: string;
  maxJoiners: number;
  createdBy: string;
  createdByEmail: string;
}): Promise<StudyGroup> {
  const db = await readDb();
  const studyGroup: StudyGroup = {
    id: randomUUID(),
    topic: input.topic.trim(),
    description: input.description.trim(),
    date: input.date,
    time: input.time,
    place: input.place.trim(),
    maxJoiners: input.maxJoiners,
    createdBy: input.createdBy.trim() || "Anonymous",
    createdByEmail: input.createdByEmail,
    joinedBy: [],
    createdAt: new Date().toISOString(),
  };
  db.studyGroups.push(studyGroup);
  await writeDb(db);
  return studyGroup;
}

/** Callable by an admin OR the session's creator — see DELETE /api/study-groups/[id]. Returns false if no such session. */
export async function deleteStudyGroup(id: string): Promise<boolean> {
  const db = await readDb();
  const index = db.studyGroups.findIndex((g) => g.id === id);
  if (index === -1) return false;
  db.studyGroups.splice(index, 1);
  await writeDb(db);
  return true;
}

/**
 * Adds an email to joinedBy. Idempotent — joining twice is a no-op, not a
 * duplicate entry. Cap/duplicate *rejection* (the user-facing errors) live
 * in the API route, same division of labor as delete's owner check —
 * this function just performs the mutation once the route decides it's
 * allowed. Returns undefined if no such session.
 */
export async function addJoiner(
  id: string,
  email: string
): Promise<StudyGroup | undefined> {
  const db = await readDb();
  const studyGroup = db.studyGroups.find((g) => g.id === id);
  if (!studyGroup) return undefined;
  if (!studyGroup.joinedBy.includes(email)) {
    studyGroup.joinedBy.push(email);
    await writeDb(db);
  }
  return studyGroup;
}

/** Removes an email from joinedBy, if present. Returns undefined if no such session. */
export async function removeJoiner(
  id: string,
  email: string
): Promise<StudyGroup | undefined> {
  const db = await readDb();
  const studyGroup = db.studyGroups.find((g) => g.id === id);
  if (!studyGroup) return undefined;
  const index = studyGroup.joinedBy.indexOf(email);
  if (index !== -1) {
    studyGroup.joinedBy.splice(index, 1);
    await writeDb(db);
  }
  return studyGroup;
}

// ---- reports ----

/** Admin-only surface (see /admin/reports) — newest first, so the most recently flagged content is what Arthur sees first. */
export async function listReports(): Promise<Report[]> {
  const { reports } = await readDb();
  return sortByNewest(reports);
}

export async function addReport(input: {
  targetType: Report["targetType"];
  targetId: string;
  targetSnapshot: string;
  targetHref: string;
  reason: string;
  reportedBy: string;
  reportedByEmail: string;
}): Promise<Report> {
  const db = await readDb();
  const report: Report = {
    id: randomUUID(),
    targetType: input.targetType,
    targetId: input.targetId,
    targetSnapshot: input.targetSnapshot,
    targetHref: input.targetHref,
    reason: input.reason.trim(),
    reportedBy: input.reportedBy,
    reportedByEmail: input.reportedByEmail,
    createdAt: new Date().toISOString(),
  };
  db.reports.push(report);
  await writeDb(db);
  return report;
}

/** Dismissing a report just deletes it — no "resolved" state to track (see the Report type's docstring). Admin-only, checked in the route. Returns false if no such report. */
export async function deleteReport(id: string): Promise<boolean> {
  const db = await readDb();
  const index = db.reports.findIndex((r) => r.id === id);
  if (index === -1) return false;
  db.reports.splice(index, 1);
  await writeDb(db);
  return true;
}
