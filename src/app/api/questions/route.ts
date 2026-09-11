import { NextRequest, NextResponse } from "next/server";
import { addQuestion, getCourse } from "@/lib/db";
import { isValidCourseCode } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { courseCode, title, body: questionBody, askedBy } = body ?? {};

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

  const question = await addQuestion({
    courseCode,
    title,
    body: questionBody,
    askedBy,
  });
  return NextResponse.json(question, { status: 201 });
}
