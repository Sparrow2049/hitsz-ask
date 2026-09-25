// The whole app is organized around one idea: everything hangs off a course
// code. "Ask a senior" and "Share resources" are really the same shape of
// problem — content, scoped to a course, contributed by a student — so they
// share this data model instead of having two disconnected systems.

export type Role = "freshman" | "sophomore" | "junior" | "senior";

export interface Identity {
  name: string;
  role: Role;
}

export interface Course {
  code: string; // e.g. "CS201" — the unit everything else is organized by
  name: string; // e.g. "Data Structures"
  year: Role; // which class year this course belongs to
}

export type ResourceType = "notes" | "past-paper" | "link" | "repo";

export interface Resource {
  id: string;
  courseCode: string;
  title: string;
  type: ResourceType;
  url: string;
  addedBy: string;
  // The real, verified Google account email — never sent to the client as
  // part of this object (routes/pages strip it before passing to "use
  // client" components). Only used server-side to check "is this mine?"
  // for edit/delete and the /my-posts page. addedBy above is what's shown
  // publicly and can be a self-declared display name — see
  // src/lib/displayName.tsx. Optional because resources added before this
  // feature existed don't have it; those just can't be self-managed by
  // their original poster (admin-delete still works on them as always).
  addedByEmail?: string;
  createdAt: string; // ISO timestamp
}

export type VoteDirection = "up" | "down";

export interface Answer {
  id: string;
  questionId: string;
  body: string;
  answeredBy: string;
  role: Role;
  createdAt: string;
  // Optional for the same reason askedByEmail/addedByEmail are: answers
  // that existed before voting shipped don't have these. readDb() defaults
  // them to [] on the way out (see the self-healing note there), so by
  // the time any other code touches an Answer, they're always arrays —
  // this optionality only matters for seed.ts's existing literals and
  // any pre-voting entry already sitting in the store. Same "never
  // reaches the client raw" treatment as StudyGroup.joinedBy: pages
  // compute upvotes/downvotes counts and the viewer's own myVote
  // server-side instead (see QuestionHeader.tsx and the answers list in
  // ask/[id]/page.tsx).
  upvotedBy?: string[];
  downvotedBy?: string[];
}

export interface Question {
  id: string;
  courseCode: string;
  title: string;
  body: string;
  askedBy: string;
  // See Resource.addedByEmail above — same rationale, same optionality
  // (questions asked before this feature existed won't have it).
  askedByEmail?: string;
  resolved: boolean;
  createdAt: string;
  answers: Answer[];
  // Optional for the same reason — see Answer.upvotedBy/downvotedBy.
  upvotedBy?: string[];
  downvotedBy?: string[];
}

// Study Buddy: unlike Resource/Question, this is a brand new feature with
// no pre-existing content, so createdByEmail is required from day one —
// no "optional because older entries don't have it" case to handle here.
export interface StudyGroup {
  id: string;
  topic: string; // freeform — deliberately NOT validated against courses,
  // see isValidCourseCode. Arthur wants people to type what they're
  // studying rather than pick from the seeded course list.
  description: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM", 24-hour
  place: string;
  maxJoiners: number;
  createdBy: string;
  // The real, verified Google account email — same rationale as
  // Resource.addedByEmail/Question.askedByEmail (never sent to the client,
  // see StudyGroupCard), used for owner-cancel via canManagePost.
  createdByEmail: string;
  // Emails of everyone who's joined. Same "never reaches the client raw"
  // treatment as createdByEmail — pages compute joinedCount/hasJoined
  // server-side instead (see src/app/study/page.tsx).
  joinedBy: string[];
  createdAt: string;
}

export type ReportTargetType = "resource" | "question" | "answer";

// Deliberately lightweight, per the brief: "a lightweight flag this... on
// resources/questions/answers, surfaced somewhere only Arthur sees." No
// status/workflow field — dismissing a report just deletes it (see
// deleteReport in db.ts); there's no "resolved but keep the record" state
// to track here.
export interface Report {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  // A short snapshot of the reported content's own text, taken at report
  // time — so a report stays legible on /admin/reports even after the
  // original resource/question/answer is later edited or deleted (deletes
  // don't cascade into existing reports).
  targetSnapshot: string;
  // A relative path to where an admin can see the flagged content in
  // context — /ask/[id] for a question or answer (answers have no detail
  // page of their own, so this points at their parent question), or the
  // resource's course page (resources only ever render as cards in a
  // list, never a detail page). Computed once at report time in the API
  // route, where the parent lookups (courseCode, or an answer's
  // question id via findAnswer) are already being done anyway.
  targetHref: string;
  reason: string;
  // Always the real Google name, never the self-declared display-name
  // override other posts allow (see sanitizeDisplayName in utils.ts) —
  // this is an admin-only accountability record, not something shown
  // publicly, so there's no reason to let it be spoofed.
  reportedBy: string;
  reportedByEmail: string;
  createdAt: string;
}

export interface DbShape {
  courses: Course[];
  resources: Resource[];
  questions: Question[];
  studyGroups: StudyGroup[];
  reports: Report[];
}
