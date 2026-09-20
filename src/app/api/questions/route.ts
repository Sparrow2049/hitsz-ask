import { NextRequest, NextResponse } from "next/server";
import { addQuestion, getCourse } from "@/lib/db";
import { isValidCourseCode, sanitizeDisplayName } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await req.json();
  const { courseCode, title, body: questionBody, displayName } = body ?? {};

  if (!isValidCourseCode(courseCode ?? "")) {
    return NextResponse.json({ error: "Invalid course code." }, { status: 400 });
  }
  if (!(await getCourse(courseCode))) {
    return NextResponse.json({ error: "Unknown course." }, { status: 404 });
  }
  if (!title?.trim() || !questionBody?.trim()) {
    return NextResponse.json(
      { error: "Title and details are required." },
      { status: 400 }
    );
  }

  // The real identity always comes from the verified session. askedBy is
  // shown as the self-declared display name when one's set (see
  // src/lib/displayName.tsx), falling back to the real name.
  const askedBy =
    sanitizeDisplayName(displayName) ??
    session.user.name ??
    session.user.email ??
    "Unknown";
  const question = await addQuestion({
    courseCode,
    title,
    body: questionBody,
    askedBy,
  });
  return NextResponse.json(question, { status: 201 });
}
