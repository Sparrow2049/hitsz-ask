import { NextRequest, NextResponse } from "next/server";
import { voteOnAnswer } from "@/lib/db";
import { auth } from "@/lib/auth";
import { VoteDirection } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; answerId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (!session.user.email) {
    return NextResponse.json(
      { error: "Your Google account has no email on file." },
      { status: 400 }
    );
  }

  const { id, answerId } = await params;
  const body = await req.json();
  const { direction } = body ?? {};

  if (direction !== "up" && direction !== "down") {
    return NextResponse.json({ error: "Invalid vote direction." }, { status: 400 });
  }

  const result = await voteOnAnswer(
    id,
    answerId,
    session.user.email,
    direction as VoteDirection
  );
  if (!result) {
    return NextResponse.json({ error: "Answer not found." }, { status: 404 });
  }
  return NextResponse.json(result);
}
