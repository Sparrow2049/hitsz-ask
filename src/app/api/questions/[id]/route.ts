import { NextResponse } from "next/server";
import { deleteQuestion } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isAdminSession } from "@/lib/utils";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  const { id } = await params;
  const deleted = await deleteQuestion(id);
  if (!deleted) {
    return NextResponse.json({ error: "Question not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
