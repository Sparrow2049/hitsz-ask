import { DbShape } from "./types";

// Seed data exists for one reason: judges only see screenshots, not a live
// demo (house rule 5). An empty app screenshots badly.
//
// Resources below link directly into the real HITSZCS repo
// (github.com/elalamiimed/HITSZCS/tree/main/Freshman), verified folder by
// folder via a sparse clone — not guessed. If HITSZCS reorganizes that repo,
// these links may need updating.

const now = new Date();
const daysAgo = (n: number) =>
  new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

const HITSZCS_FRESHMAN =
  "https://github.com/elalamiimed/HITSZCS/tree/main/Freshman";

export const seedData: DbShape = {
  courses: [
    { code: "MATH100", name: "Pre-Calculus" },
    { code: "MATH101", name: "Calculus" },
    { code: "MATH102", name: "Linear Algebra" },
    { code: "PHYS101", name: "College Physics IA" },
    { code: "PHYS102", name: "Electric Circuits" },
    { code: "PHYS103", name: "Physics Lab IA" },
    { code: "CHIN101", name: "Elementary Chinese I" },
    { code: "CHIN102", name: "Elementary Chinese II" },
    { code: "GEN100", name: "General / Freshman Life" },
  ],
  resources: [
    // Pre-Calculus
    {
      id: "r1",
      courseCode: "MATH100",
      title: "Pre-Calculus — full folder (notes, homework, exam papers)",
      type: "repo",
      url: `${HITSZCS_FRESHMAN}/Pre-Calculus`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(9),
    },
    {
      id: "r2",
      courseCode: "MATH100",
      title: "Pre-Calculus exam model papers",
      type: "past-paper",
      url: `${HITSZCS_FRESHMAN}/Pre-Calculus/Exam%20model%20paper`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(8),
    },
    // Calculus
    {
      id: "r3",
      courseCode: "MATH101",
      title: "Calculus lecture slides",
      type: "notes",
      url: `${HITSZCS_FRESHMAN}/Calculus/Lessons`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(7),
    },
    {
      id: "r4",
      courseCode: "MATH101",
      title: "Calculus model tests",
      type: "past-paper",
      url: `${HITSZCS_FRESHMAN}/Calculus/Model%20Test`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(6),
    },
    // Linear Algebra (the real folder name has a trailing space — kept
    // intentionally so the link actually resolves)
    {
      id: "r5",
      courseCode: "MATH102",
      title: "Linear Algebra — 2025 materials",
      type: "repo",
      url: `${HITSZCS_FRESHMAN}/Linear%20Algebra%20/2025`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(5),
    },
    // College Physics IA
    {
      id: "r6",
      courseCode: "PHYS101",
      title: "College Physics IA lecture slides",
      type: "notes",
      url: `${HITSZCS_FRESHMAN}/College%20Physics%20IA/Lessons`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(6),
    },
    {
      id: "r7",
      courseCode: "PHYS101",
      title: "College Physics IA quizzes",
      type: "past-paper",
      url: `${HITSZCS_FRESHMAN}/College%20Physics%20IA/Quiz`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(4),
    },
    // Electric Circuits
    {
      id: "r8",
      courseCode: "PHYS102",
      title: "Electric Circuits lecture slides",
      type: "notes",
      url: `${HITSZCS_FRESHMAN}/Electric%20Circuits/Lessons`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(3),
    },
    // Physics Lab IA — the actual lab-reports-and-experiments folder
    {
      id: "r9",
      courseCode: "PHYS103",
      title: "Physics Lab IA — instruction book & sample experiment reports",
      type: "repo",
      url: `${HITSZCS_FRESHMAN}/Physics%20Lab%20IA`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(2),
    },
    // Chinese
    {
      id: "r10",
      courseCode: "CHIN101",
      title: "Elementary Chinese I — 2025 materials",
      type: "repo",
      url: `${HITSZCS_FRESHMAN}/Elementary%20Chinese%20I/2025`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(5),
    },
    {
      id: "r11",
      courseCode: "CHIN102",
      title: "Elementary Chinese II — course materials",
      type: "repo",
      url: `${HITSZCS_FRESHMAN}/Elementary%20Chinese%20II`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(4),
    },
  ],
  questions: [
    {
      id: "q1",
      courseCode: "GEN100",
      title: "What was the hardest class in freshman year?",
      body: "Trying to plan out how much time to budget for each course this term — curious what upperclassmen found hardest and why.",
      askedBy: "New Freshman",
      resolved: false,
      createdAt: daysAgo(2),
      answers: [],
    },
    {
      id: "q2",
      courseCode: "MATH100",
      title: "I failed my Pre-Calculus initial exam — what should I do now?",
      body: "Just got my result back and I didn't pass the Pre-Calculus placement exam. Not sure what happens next — do I retake it, get placed in a different track, or something else? Has anyone been through this?",
      askedBy: "New Freshman",
      resolved: false,
      createdAt: daysAgo(1),
      answers: [],
    },
  ],
};
