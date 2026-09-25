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
const HITSZCS_SOPHOMORE =
  "https://github.com/elalamiimed/HITSZCS/tree/main/Sophomore";
const HITSZCS_JUNIOR =
  "https://github.com/elalamiimed/HITSZCS/tree/main/Junior";
// No Senior folder exists in HITSZCS yet — current senior cohort hasn't
// graduated/contributed. Senior shows "Soon to be added" in the UI instead
// of fabricated courses.

export const seedData: DbShape = {
  courses: [
    { code: "MATH100", name: "Pre-Calculus", year: "freshman" },
    { code: "MATH101", name: "Calculus", year: "freshman" },
    { code: "MATH102", name: "Linear Algebra", year: "freshman" },
    { code: "PHYS101", name: "College Physics IA", year: "freshman" },
    { code: "PHYS102", name: "Electric Circuits", year: "freshman" },
    { code: "PHYS103", name: "Physics Lab IA", year: "freshman" },
    { code: "CHIN101", name: "Elementary Chinese I", year: "freshman" },
    { code: "CHIN102", name: "Elementary Chinese II", year: "freshman" },
    { code: "GEN100", name: "General / Freshman Life", year: "freshman" },
    // Sophomore — folder names verified the same way as Freshman (sparse
    // clone, checked for trailing spaces — none this time).
    { code: "MATH201", name: "Probability and Statistics", year: "sophomore" },
    { code: "PHYS201", name: "College Physics IB", year: "sophomore" },
    { code: "PHYS202", name: "Physics Lab IB", year: "sophomore" },
    { code: "CHIN201", name: "Intermediate Chinese I", year: "sophomore" },
    { code: "GEN200", name: "Life And Health Science", year: "sophomore" },
    { code: "CS201", name: "Data Structures", year: "sophomore" },
    { code: "CS202", name: "Computer Networks", year: "sophomore" },
    { code: "CS203", name: "High-level Language Programming", year: "sophomore" },
    { code: "EE201", name: "Fundamentals of Electronic Technology", year: "sophomore" },
    // Junior
    { code: "CS301", name: "OOP", year: "junior" },
    { code: "CS302", name: "Data Base Systems", year: "junior" },
    { code: "CS303", name: "Distributed Systems", year: "junior" },
    { code: "CS304", name: "AI", year: "junior" },
    { code: "CS305", name: "ML", year: "junior" },
    { code: "EE301", name: "Signals and Systems", year: "junior" },
    { code: "EE302", name: "Signals and Systems — Lab", year: "junior" },
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
    // --- Sophomore ---
    {
      id: "r12",
      courseCode: "MATH201",
      title: "Probability and Statistics lecture slides",
      type: "notes",
      url: `${HITSZCS_SOPHOMORE}/Probability%20and%20Statistics/2025/Slides`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(3),
    },
    {
      id: "r13",
      courseCode: "PHYS201",
      title: "College Physics IB — 2025 materials (slides, tutorials, exam prep)",
      type: "repo",
      url: `${HITSZCS_SOPHOMORE}/College%20Physics%20IB/2025`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(3),
    },
    {
      id: "r14",
      courseCode: "PHYS202",
      title: "Physics Lab IB — experiment guides",
      type: "repo",
      url: `${HITSZCS_SOPHOMORE}/Physics%20Lab%20IB`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(3),
    },
    {
      id: "r15",
      courseCode: "CHIN201",
      title: "Intermediate Chinese I — course materials",
      type: "repo",
      url: `${HITSZCS_SOPHOMORE}/Intermediate%20Chinese%20I`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(3),
    },
    {
      id: "r16",
      courseCode: "GEN200",
      title: "Life and Health Science — weekly materials",
      type: "repo",
      url: `${HITSZCS_SOPHOMORE}/Life%20And%20Health%20Science`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(3),
    },
    {
      id: "r17",
      courseCode: "CS201",
      title: "Data Structures lecture slides",
      type: "notes",
      url: `${HITSZCS_SOPHOMORE}/Data%20Structures/Slides`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(3),
    },
    {
      id: "r18",
      courseCode: "CS202",
      title: "Computer Networks lecture slides",
      type: "notes",
      url: `${HITSZCS_SOPHOMORE}/Computer%20Networks/Slides`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(3),
    },
    {
      id: "r19",
      courseCode: "CS203",
      title: "High-level Language Programming (C++) slides",
      type: "notes",
      url: `${HITSZCS_SOPHOMORE}/High-level%20Language%20Programming/2025/Slides`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(3),
    },
    {
      id: "r20",
      courseCode: "EE201",
      title: "Fundamentals of Electronic Technology — 2025 materials",
      type: "repo",
      url: `${HITSZCS_SOPHOMORE}/Fundamentals%20of%20Electronic%20Technology/2025`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(3),
    },
    // --- Junior ---
    {
      id: "r21",
      courseCode: "CS301",
      title: "OOP lecture notes",
      type: "notes",
      url: `${HITSZCS_JUNIOR}/OOP/Lessons`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(2),
    },
    {
      id: "r22",
      courseCode: "CS302",
      title: "Database Systems lecture slides",
      type: "notes",
      url: `${HITSZCS_JUNIOR}/Data%20Base%20Systems/Fall%202025/Lecture`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(2),
    },
    {
      id: "r23",
      courseCode: "CS303",
      title: "Distributed Systems lecture notes",
      type: "notes",
      url: `${HITSZCS_JUNIOR}/Distributed%20systems/Lessons`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(2),
    },
    {
      id: "r24",
      courseCode: "CS304",
      title: "AI lecture notes",
      type: "notes",
      url: `${HITSZCS_JUNIOR}/AI/Lecture%20Notes`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(2),
    },
    {
      id: "r25",
      courseCode: "CS305",
      title: "Machine Learning lecture notes",
      type: "notes",
      url: `${HITSZCS_JUNIOR}/ML/Lessons`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(2),
    },
    {
      id: "r26",
      courseCode: "EE301",
      title: "Signals and Systems lecture notes",
      type: "notes",
      url: `${HITSZCS_JUNIOR}/Signals%20and%20systems/Lessons`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(2),
    },
    {
      id: "r27",
      courseCode: "EE302",
      title: "Signals and Systems — lab experiment reports",
      type: "repo",
      url: `${HITSZCS_JUNIOR}/Signals%20and%20systems%20EXP`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(2),
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
  // No seed entries here on purpose — unlike courses/resources/questions,
  // this app is live now (not screenshot-judged), so a fake demo study
  // session with a made-up creator would be misleading rather than
  // helpful. Starts empty; real sessions come from real sign-ins.
  studyGroups: [],
  // Same reasoning as studyGroups above — starts empty, no fake demo
  // reports on a live site.
  reports: [],
};
