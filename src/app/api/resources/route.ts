import { NextRequest, NextResponse } from "next/server";
import { addResource, getCourse } from "@/lib/db";
import { isValidCourseCode } from "@/lib/utils";
import { ResourceType } from "@/lib/types";

const VALID_TYPES: ResourceType[] = ["notes", "past-paper", "link", "repo"];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { courseCode, title, type, url, addedBy } = body ?? {};

  if (!isValidCourseCode(courseCode ?? "")) {
    return NextResponse.json({ error: "Invalid course code." }, { status: 400 });
  }
  if (!(await getCourse(courseCode))) {
    return NextResponse.json({ error: "Unknown course." }, { status: 404 });
  }
  if (!title?.trim() || !url?.trim()) {
    return NextResponse.json(
      { error: "Title and URL are required." },
      { status: 400 }
    );
  }
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid resource type." }, { status: 400 });
  }

  const resource = await addResource({ courseCode, title, type, url, addedBy });
  return NextResponse.json(resource, { status: 201 });
}
