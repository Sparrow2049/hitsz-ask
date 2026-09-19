import { NextRequest, NextResponse } from "next/server";
import { addQuestion, getCourse } from "@/lib/db";
import { isValidCourseCode } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await req.json();
  const { courseCode, title, body: questionBody } = body ?? {};

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

  // askedBy comes from the verified session, never trusted from the
  // client body.
  const askedBy = session.user.name ?? session.user.email ?? "Unknown";
  const question = await addQuestion({
    courseCode,
    title,
    body: questionBody,
    askedBy,
  });
  return NextResponse.json(question, { status: 201 });
}
