import { NextResponse } from "next/server";
import { addJoiner, getStudyGroup, removeJoiner } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const { id } = await params;

  const studyGroup = await getStudyGroup(id);
  if (!studyGroup) {
    return NextResponse.json(
      { error: "Study session not found." },
      { status: 404 }
    );
  }
  if (studyGroup.joinedBy.includes(session.user.email)) {
    return NextResponse.json(
      { error: "You've already joined this session." },
      { status: 400 }
    );
  }
  // Checked here, not just relied on as UI state — the card's "Full"
  // disabled-button is a convenience, not the source of truth; someone
  // could still hit this endpoint directly once the cap fills between
  // page load and click.
  if (studyGroup.joinedBy.length >= studyGroup.maxJoiners) {
    return NextResponse.json({ error: "This session is full." }, { status: 409 });
  }

  const updated = await addJoiner(id, session.user.email);
  return NextResponse.json({
    joinedCount: updated!.joinedBy.length,
    hasJoined: true,
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const { id } = await params;

  const studyGroup = await getStudyGroup(id);
  if (!studyGroup) {
    return NextResponse.json(
      { error: "Study session not found." },
      { status: 404 }
    );
  }
  if (!studyGroup.joinedBy.includes(session.user.email)) {
    return NextResponse.json(
      { error: "You haven't joined this session." },
      { status: 400 }
    );
  }

  const updated = await removeJoiner(id, session.user.email);
  return NextResponse.json({
    joinedCount: updated!.joinedBy.length,
    hasJoined: false,
  });
}
