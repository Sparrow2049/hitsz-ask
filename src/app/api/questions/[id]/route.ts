import { NextResponse } from "next/server";
import { deleteQuestion, getQuestion, updateQuestion } from "@/lib/db";
import { auth } from "@/lib/auth";
import { canManagePost } from "@/lib/utils";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  const question = await getQuestion(id);
  if (!question) {
    return NextResponse.json({ error: "Question not found." }, { status: 404 });
  }
  if (!canManagePost(session, question.askedByEmail)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  await deleteQuestion(id);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  const question = await getQuestion(id);
  if (!question) {
    return NextResponse.json({ error: "Question not found." }, { status: 404 });
  }
  if (!canManagePost(session, question.askedByEmail)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  const body = await req.json();
  const { title, body: questionBody } = body ?? {};

  // Same validation as asking one — see POST /api/questions. courseCode
  // and resolved aren't accepted here at all (see updateQuestion's
  // docstring in db.ts).
  if (!title?.trim() || !questionBody?.trim()) {
    return NextResponse.json(
      { error: "Title and details are required." },
      { status: 400 }
    );
  }

  const updated = await updateQuestion(id, { title, body: questionBody });
  return NextResponse.json(updated);
}
