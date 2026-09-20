import { NextRequest, NextResponse } from "next/server";
import { addAnswer, getQuestion } from "@/lib/db";
import { Role } from "@/lib/types";
import { ROLE_ORDER, sanitizeDisplayName } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { body: answerBody, role, displayName } = body ?? {};

  if (!(await getQuestion(id))) {
    return NextResponse.json({ error: "Question not found." }, { status: 404 });
  }
  if (!answerBody?.trim()) {
    return NextResponse.json({ error: "Answer can't be empty." }, { status: 400 });
  }
  if (!ROLE_ORDER.includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  // The real identity always comes from the verified session. `role`
  // stays client-supplied since it's a self-declared preference Google
  // can't verify (see src/lib/role.tsx) — validated against ROLE_ORDER
  // above. answeredBy shows the self-declared display name when one's
  // set (see src/lib/displayName.tsx), falling back to the real name.
  const answeredBy =
    sanitizeDisplayName(displayName) ??
    session.user.name ??
    session.user.email ??
    "Unknown";
  const answer = await addAnswer(id, {
    body: answerBody,
    answeredBy,
    role: role as Role,
  });
  return NextResponse.json(answer, { status: 201 });
}
