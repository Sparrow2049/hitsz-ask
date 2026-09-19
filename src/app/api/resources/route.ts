import { NextRequest, NextResponse } from "next/server";
import { addResource, getCourse } from "@/lib/db";
import { isValidCourseCode, isBlockedResourceUrl } from "@/lib/utils";
import { ResourceType } from "@/lib/types";
import { auth } from "@/lib/auth";

const VALID_TYPES: ResourceType[] = ["notes", "past-paper", "link", "repo"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await req.json();
  const { courseCode, title, type, url } = body ?? {};

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
  if (isBlockedResourceUrl(url)) {
    return NextResponse.json(
      { error: "That link isn't allowed here." },
      { status: 400 }
    );
  }

  // addedBy comes from the verified session, never trusted from the
  // client body — see docs/decisions.md.
  const addedBy = session.user.name ?? session.user.email ?? "Unknown";
  const resource = await addResource({ courseCode, title, type, url, addedBy });
  return NextResponse.json(resource, { status: 201 });
}
