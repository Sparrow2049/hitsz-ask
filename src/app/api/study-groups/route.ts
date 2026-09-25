import { NextRequest, NextResponse } from "next/server";
import { addStudyGroup } from "@/lib/db";
import { sanitizeDisplayName } from "@/lib/utils";
import { auth } from "@/lib/auth";

const MIN_JOINERS = 2;
const MAX_JOINERS = 100;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  // Same reasoning as /api/resources and /api/questions: should never
  // actually trigger, but createdByEmail is what owner-cancel keys off
  // of, so fail loudly here rather than silently storing a session no
  // one (but an admin) could ever manage.
  if (!session.user.email) {
    return NextResponse.json(
      { error: "Your Google account has no email on file." },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { topic, description, date, time, place, maxJoiners, displayName } =
    body ?? {};

  if (!topic?.trim()) {
    return NextResponse.json({ error: "Topic is required." }, { status: 400 });
  }
  if (!date?.trim() || !time?.trim()) {
    return NextResponse.json(
      { error: "Date and time are required." },
      { status: 400 }
    );
  }
  if (!place?.trim()) {
    return NextResponse.json({ error: "Place is required." }, { status: 400 });
  }
  const scheduled = new Date(`${date}T${time}`);
  if (Number.isNaN(scheduled.getTime())) {
    return NextResponse.json({ error: "Invalid date or time." }, { status: 400 });
  }
  if (scheduled.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "Pick a date and time in the future." },
      { status: 400 }
    );
  }
  const cap = Number(maxJoiners);
  if (!Number.isInteger(cap) || cap < MIN_JOINERS || cap > MAX_JOINERS) {
    return NextResponse.json(
      {
        error: `Max people must be a whole number between ${MIN_JOINERS} and ${MAX_JOINERS}.`,
      },
      { status: 400 }
    );
  }

  // Same real-identity-from-session, display-name-is-just-a-label pattern
  // as every other create route — see resources/route.ts.
  const createdBy =
    sanitizeDisplayName(displayName) ??
    session.user.name ??
    session.user.email ??
    "Unknown";

  const studyGroup = await addStudyGroup({
    topic,
    description: description ?? "",
    date,
    time,
    place,
    maxJoiners: cap,
    createdBy,
    createdByEmail: session.user.email,
  });
  return NextResponse.json(studyGroup, { status: 201 });
}
