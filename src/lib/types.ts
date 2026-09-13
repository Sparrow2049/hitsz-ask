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
  createdAt: string; // ISO timestamp
}

export interface Answer {
  id: string;
  questionId: string;
  body: string;
  answeredBy: string;
  role: Role;
  createdAt: string;
}

export interface Question {
  id: string;
  courseCode: string;
  title: string;
  body: string;
  askedBy: string;
  resolved: boolean;
  createdAt: string;
  answers: Answer[];
}

export interface DbShape {
  courses: Course[];
  resources: Resource[];
  questions: Question[];
}
