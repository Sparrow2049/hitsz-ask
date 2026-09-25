import { NextRequest, NextResponse } from "next/server";
import { addResource, getCourse } from "@/lib/db";
import { isValidCourseCode, isBlockedResourceUrl, sanitizeDisplayName } from "@/lib/utils";
import { ResourceType } from "@/lib/types";
import { auth } from "@/lib/auth";

const VALID_TYPES: ResourceType[] = ["notes", "past-paper", "link", "repo"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  // Google always provides an email with the openid/email/profile scopes
  // this app requests, so this should never actually trigger — but
  // addedByEmail is what the owner-delete/edit and /my-posts checks key
  // off of, so it's worth failing loudly here rather than silently
  // storing a resource no one (but an admin) could ever manage.
  if (!session.user.email) {
    return NextResponse.json(
      { error: "Your Google account has no email on file." },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { courseCode, title, type, url, displayName } = body ?? {};

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

  // The real identity always comes from the verified session, never
  // trusted from the client body — see docs/decisions.md. What we show
  // as addedBy can be overridden by a self-declared display name (like
  // `role`, this is client-supplied and unverified — see
  // src/lib/displayName.tsx and sanitizeDisplayName's docstring for why
  // that's an accepted tradeoff here), falling back to the real name.
  const addedBy =
    sanitizeDisplayName(displayName) ??
    session.user.name ??
    session.user.email ??
    "Unknown";
  const resource = await addResource({
    courseCode,
    title,
    type,
    url,
    addedBy,
    addedByEmail: session.user.email,
  });
  return NextResponse.json(resource, { status: 201 });
}
