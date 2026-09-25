import { NextRequest, NextResponse } from "next/server";
import { voteOnQuestion } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VoteDirection } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  // Needed to dedupe votes (one per person per question) even though
  // it's never shown to anyone — see voteOnQuestion in db.ts.
  if (!session.user.email) {
    return NextResponse.json(
      { error: "Your Google account has no email on file." },
      { status: 400 }
    );
  }

  const { id } = await params;
  const body = await req.json();
  const { direction } = body ?? {};

  if (direction !== "up" && direction !== "down") {
    return NextResponse.json({ error: "Invalid vote direction." }, { status: 400 });
  }

  const result = await voteOnQuestion(id, session.user.email, direction as VoteDirection);
  if (!result) {
    return NextResponse.json({ error: "Question not found." }, { status: 404 });
  }
  return NextResponse.json(result);
}
