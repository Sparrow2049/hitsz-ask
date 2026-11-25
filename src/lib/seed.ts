import { DbShape } from "./types";

// Seed data exists for one reason: judges only see screenshots, not a live
// demo (house rule 5). An empty app screenshots badly.
//
// Resources below link directly into the real HITSZCS repo
// (github.com/elalamiimed/HITSZCS), verified folder by folder against a
// fresh clone — not guessed. The repo has been reorganised twice: first the
// old top-level Freshman/, Sophomore/ and Junior/ folders were replaced by
// one folder per school (Oct 2026), then those folders were given number
// prefixes ("1. Public Compulsories", ...) and a new "AS Study Materials"
// folder appeared (Nov 2026). The mapping onto the site's groups:
//
//   1. Public Compulsories/Freshmen  -> "public",         year freshman
//   1. Public Compulsories/Sophomore -> "public",         year sophomore
//   2. College of Informatics        -> "informatics",    year junior
//   3. College of AI                 -> "ai"
//   4. College of Future Studies     -> "future-studies"
//   5. Elective Courses + 6. General Courses -> "electives", year "any"
//   AS Study Materials: student-written review notes and practice exams for
//     courses that already exist above (HLL, Linear Algebra, Physics IB), so
//     they're extra resources on those courses, not a group of their own.
//
// The repo says which year only for Public Compulsories. For the rest, the
// year comes from the curriculum PDFs in the repo's Curriculum/ folder where
// they cover it (Economics, Econometrics, International Trade), and is a
// best guess otherwise (College of AI, Architecture) — those are easy to
// correct here. If HITSZCS reorganizes again, these links may need updating
// — re-check each one against a fresh clone of the repo, which is how the
// links below were verified.

const now = new Date();
const daysAgo = (n: number) =>
  new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

const HITSZCS = "https://github.com/elalamiimed/HITSZCS/tree/main";
const HITSZCS_FRESHMEN = `${HITSZCS}/1.%20Public%20Compulsories/Freshmen`;
const HITSZCS_SOPHOMORE = `${HITSZCS}/1.%20Public%20Compulsories/Sophomore`;
const HITSZCS_INFORMATICS = `${HITSZCS}/2.%20College%20of%20Informatics`;
const HITSZCS_AI = `${HITSZCS}/3.%20College%20of%20AI`;
const HITSZCS_FUTURE = `${HITSZCS}/4.%20College%20of%20Future%20Studies`;
const HITSZCS_ELECTIVES = `${HITSZCS}/5.%20Elective%20Courses`;
const HITSZCS_GENERAL = `${HITSZCS}/6.%20General%20Courses`;
const HITSZCS_AS = `${HITSZCS}/AS%20Study%20Materials`;

export const seedData: DbShape = {
  courses: [
    // --- Public compulsories: Freshmen ---
    { code: "MATH100", name: "Pre-Calculus", year: "freshman", school: "public" },
    { code: "MATH101", name: "Calculus", year: "freshman", school: "public" },
    { code: "MATH102", name: "Linear Algebra", year: "freshman", school: "public" },
    { code: "PHYS101", name: "College Physics IA", year: "freshman", school: "public" },
    { code: "PHYS102", name: "Electric Circuits", year: "freshman", school: "public" },
    { code: "PHYS103", name: "Physics Lab IA", year: "freshman", school: "public" },
    { code: "CHIN101", name: "Elementary Chinese I", year: "freshman", school: "public" },
    { code: "CHIN102", name: "Elementary Chinese II", year: "freshman", school: "public" },
    // Not a folder in HITSZCS — a catch-all for general freshman-life questions.
    { code: "GEN100", name: "General / Freshman Life", year: "freshman", school: "public" },
    // Moved from Sophomore to Freshmen in the reorganised repo. Code kept as
    // GEN200 on purpose: questions and resources are keyed by course code, so
    // renaming it would orphan anything already posted under it.
    { code: "GEN200", name: "Life And Health Science", year: "freshman", school: "public" },
    // --- Public compulsories: Sophomore ---
    { code: "MATH201", name: "Probability and Statistics", year: "sophomore", school: "public" },
    { code: "PHYS201", name: "College Physics IB", year: "sophomore", school: "public" },
    { code: "PHYS202", name: "Physics Lab IB", year: "sophomore", school: "public" },
    { code: "CHIN201", name: "Intermediate Chinese I", year: "sophomore", school: "public" },
    { code: "CS201", name: "Data Structures", year: "sophomore", school: "public" },
    { code: "CS202", name: "Computer Networks", year: "sophomore", school: "public" },
    { code: "CS203", name: "High-level Language Programming", year: "sophomore", school: "public" },
    { code: "EE201", name: "Fundamentals of Electronic Technology", year: "sophomore", school: "public" },
    // --- College of Informatics (shown as Junior, as before) ---
    { code: "CS301", name: "OOP", year: "junior", school: "informatics" },
    { code: "CS302", name: "Data Base Systems", year: "junior", school: "informatics" },
    { code: "CS303", name: "Distributed Systems", year: "junior", school: "informatics" },
    { code: "CS304", name: "AI", year: "junior", school: "informatics" },
    { code: "CS305", name: "ML", year: "junior", school: "informatics" },
    { code: "EE301", name: "Signals and Systems", year: "junior", school: "informatics" },
    { code: "EE302", name: "Signals and Systems — Lab", year: "junior", school: "informatics" },
    // --- College of Future Studies ---
    // Years from the School of Economics and Management curriculum PDF in
    // the repo (Curriculum/): Introduction to Economics and Management is
    // Year 1 spring, Introductory Econometrics is Year 2 fall, International
    // Trade is Year 3 fall. Architecture isn't in that PDF — its year is a
    // guess. The repo folders are called "Intro to Economics and
    // Management", "Intro to Econometrics", "International Trade" and
    // "Architecture".
    { code: "ECON101", name: "Introduction to Economics and Management", year: "freshman", school: "future-studies" },
    { code: "ECON201", name: "Introduction to Econometrics", year: "sophomore", school: "future-studies" },
    { code: "ARCH201", name: "Architecture", year: "sophomore", school: "future-studies" },
    { code: "ECON301", name: "International Trade", year: "junior", school: "future-studies" },
    // --- College of AI ---
    // Years are a best guess — nothing in the repo says when these are taken.
    { code: "ME101", name: "Introduction to Mechanical Engineering", year: "freshman", school: "ai" },
    { code: "ME201", name: "Engineering Mechanics", year: "sophomore", school: "ai" },
    { code: "ME202", name: "Mechanics of Materials", year: "sophomore", school: "ai" },
    { code: "ME301", name: "Fundamentals of Mechanical Design", year: "junior", school: "ai" },
    // --- General electives: HITSZCS's Elective Courses + General Courses
    // folders, merged. Open to any year, so no year sub-heading.
    { code: "ELEC001", name: "Survey of China", year: "any", school: "electives" },
    { code: "ELEC002", name: "Chinese Path to Modernization", year: "any", school: "electives" },
    { code: "ELEC003", name: "Environmental Governance of Contemporary China", year: "any", school: "electives" },
  ],
  resources: [
    // Pre-Calculus
    {
      id: "r1",
      courseCode: "MATH100",
      title: "Pre-Calculus — full folder (notes, homework, exam papers)",
      type: "repo",
      url: `${HITSZCS_FRESHMEN}/Pre-Calculus`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(9),
    },
    {
      id: "r2",
      courseCode: "MATH100",
      title: "Pre-Calculus exam model papers",
      type: "past-paper",
      url: `${HITSZCS_FRESHMEN}/Pre-Calculus/Exam%20model%20paper`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(8),
    },
    // Calculus
    {
      id: "r3",
      courseCode: "MATH101",
      title: "Calculus lecture slides",
      type: "notes",
      url: `${HITSZCS_FRESHMEN}/Calculus/Lessons`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(7),
    },
    {
      id: "r4",
      courseCode: "MATH101",
      title: "Calculus model tests",
      type: "past-paper",
      url: `${HITSZCS_FRESHMEN}/Calculus/Model%20Test`,
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
      url: `${HITSZCS_FRESHMEN}/Linear%20Algebra%20/2025`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(5),
    },
    // College Physics IA
    {
      id: "r6",
      courseCode: "PHYS101",
      title: "College Physics IA lecture slides",
      type: "notes",
      url: `${HITSZCS_FRESHMEN}/College%20Physics%20IA/Lessons`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(6),
    },
    {
      id: "r7",
      courseCode: "PHYS101",
      title: "College Physics IA quizzes",
      type: "past-paper",
      url: `${HITSZCS_FRESHMEN}/College%20Physics%20IA/Quiz`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(4),
    },
    // Electric Circuits
    {
      id: "r8",
      courseCode: "PHYS102",
      title: "Electric Circuits lecture slides",
      type: "notes",
      url: `${HITSZCS_FRESHMEN}/Electric%20Circuits/Lessons`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(3),
    },
    // Physics Lab IA — the actual lab-reports-and-experiments folder
    {
      id: "r9",
      courseCode: "PHYS103",
      title: "Physics Lab IA — instruction book & sample experiment reports",
      type: "repo",
      url: `${HITSZCS_FRESHMEN}/Physics%20Lab%20IA`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(2),
    },
    // Chinese
    {
      id: "r10",
      courseCode: "CHIN101",
      title: "Elementary Chinese I — 2025 materials",
      type: "repo",
      url: `${HITSZCS_FRESHMEN}/Elementary%20Chinese%20I/2025`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(5),
    },
    {
      id: "r11",
      courseCode: "CHIN102",
      title: "Elementary Chinese II — course materials",
      type: "repo",
      url: `${HITSZCS_FRESHMEN}/Elementary%20Chinese%20II`,
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
      url: `${HITSZCS_FRESHMEN}/Life%20And%20Health%20Science`,
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
      url: `${HITSZCS_INFORMATICS}/OOP/Lessons`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(2),
    },
    {
      id: "r22",
      courseCode: "CS302",
      title: "Database Systems lecture slides",
      type: "notes",
      url: `${HITSZCS_INFORMATICS}/Data%20Base%20Systems/Fall%202025/Lecture`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(2),
    },
    {
      id: "r23",
      courseCode: "CS303",
      title: "Distributed Systems lecture notes",
      type: "notes",
      url: `${HITSZCS_INFORMATICS}/Distributed%20systems/Lessons`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(2),
    },
    {
      id: "r24",
      courseCode: "CS304",
      title: "AI lecture notes",
      type: "notes",
      url: `${HITSZCS_INFORMATICS}/AI/Lecture%20Notes`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(2),
    },
    {
      id: "r25",
      courseCode: "CS305",
      title: "Machine Learning lecture notes",
      type: "notes",
      url: `${HITSZCS_INFORMATICS}/ML/Lessons`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(2),
    },
    {
      id: "r26",
      courseCode: "EE301",
      title: "Signals and Systems lecture notes",
      type: "notes",
      url: `${HITSZCS_INFORMATICS}/Signals%20and%20systems/Lessons`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(2),
    },
    {
      id: "r27",
      courseCode: "EE302",
      title: "Signals and Systems — lab experiment reports",
      type: "repo",
      url: `${HITSZCS_INFORMATICS}/Signals%20and%20systems%20EXP`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(2),
    },
    // --- College of Future Studies ---
    {
      id: "r28",
      courseCode: "ECON101",
      title: "Intro to Economics and Management — course folder (incl. Mankiw, Principles of Economics)",
      type: "repo",
      url: `${HITSZCS_FUTURE}/Intro%20to%20Economics%20and%20Management`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(1),
    },
    {
      id: "r29",
      courseCode: "ECON101",
      title: "Introduction to Management lecture slides",
      type: "notes",
      url: `${HITSZCS_FUTURE}/Intro%20to%20Economics%20and%20Management/Introduction%20to%20Management`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(1),
    },
    {
      id: "r30",
      courseCode: "ECON201",
      title: "Introduction to Econometrics — lectures, exercises & Wooldridge textbook",
      type: "repo",
      url: `${HITSZCS_FUTURE}/Intro%20to%20Econometrics`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(1),
    },
    // --- College of AI ---
    {
      id: "r31",
      courseCode: "ME101",
      title: "Introduction to Mechanical Engineering — course materials",
      type: "repo",
      url: `${HITSZCS_AI}/Introduction%20to%20Mechanical%20Engineering`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(1),
    },
    {
      id: "r32",
      courseCode: "ME201",
      title: "Engineering Mechanics — lectures and homework with solutions",
      type: "repo",
      url: `${HITSZCS_AI}/Engineering%20Mechanics`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(1),
    },
    {
      id: "r33",
      courseCode: "ME202",
      title: "Mechanics of Materials — chapter slides",
      type: "notes",
      url: `${HITSZCS_AI}/Mechanics%20of%20Materials`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(1),
    },
    {
      id: "r34",
      courseCode: "ME301",
      title: "Fundamentals of Mechanical Design — chapter slides",
      type: "notes",
      url: `${HITSZCS_AI}/Fundamentals%20of%20Mechanical%20Design`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(1),
    },
    // --- General electives ---
    {
      id: "r35",
      courseCode: "ELEC001",
      title: "Survey of China — lecture slides and revision notes",
      type: "notes",
      url: `${HITSZCS_ELECTIVES}/Survey%20of%20China`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(1),
    },
    {
      id: "r36",
      courseCode: "ELEC002",
      title: "Chinese Path to Modernization — readings and assignment info",
      type: "repo",
      url: `${HITSZCS_ELECTIVES}/Chinese%20Path%20to%20Modernization`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(1),
    },
    {
      id: "r37",
      courseCode: "ELEC003",
      title: "Environmental Governance of Contemporary China — lecture slides",
      type: "notes",
      url: `${HITSZCS_GENERAL}/Environmental%20Governance%20of%20Contemporary%20China`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(1),
    },
    // --- Added with the Nov 2026 repo update ---
    {
      id: "r38",
      courseCode: "ECON301",
      title: "International Trade — lecture slides 1–11",
      type: "notes",
      url: `${HITSZCS_FUTURE}/International%20Trade`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(0),
    },
    {
      id: "r39",
      courseCode: "ARCH201",
      title: "Architecture — SketchUp, CAD and Environmental Psychology lectures",
      type: "repo",
      url: `${HITSZCS_FUTURE}/Architecture`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(0),
    },
    // AS Study Materials: student-written reviews and practice papers for
    // courses that already have a home above.
    {
      id: "r40",
      courseCode: "CS203",
      title: "HLL student reviews, summaries and C++ cheat sheet",
      type: "notes",
      url: `${HITSZCS_AS}/HLL`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(0),
    },
    {
      id: "r41",
      courseCode: "CS203",
      title: "HLL C++ practice papers with answer keys",
      type: "past-paper",
      url: `${HITSZCS_AS}/HLL/Practice%20exams`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(0),
    },
    {
      id: "r42",
      courseCode: "MATH102",
      title: "Linear Algebra midterm prep — student reviews and summaries",
      type: "notes",
      url: `${HITSZCS_AS}/Linear%20Algebra/Midterm%20prep`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(0),
    },
    {
      id: "r43",
      courseCode: "MATH102",
      title: "Linear Algebra model tests with answers and methods",
      type: "past-paper",
      url: `${HITSZCS_AS}/Linear%20Algebra/Midterm%20prep/Model%20Exams`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(0),
    },
    {
      id: "r44",
      courseCode: "PHYS201",
      title: "Physics IB midterm prep — thermodynamics review",
      type: "notes",
      url: `${HITSZCS_AS}/Physics%20IB/Midterm%20prep`,
      addedBy: "HITSZCS archive",
      createdAt: daysAgo(0),
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
