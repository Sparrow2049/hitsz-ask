import { NextResponse } from "next/server";
import { deleteReport } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isAdminSession } from "@/lib/utils";

// Admin-only, full stop — unlike resource/question delete, there's no
// "the reporter can also manage their own report" case (see Report's
// docstring in types.ts: this is a review surface only Arthur sees).
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  const { id } = await params;

  await deleteReport(id);
  return NextResponse.json({ ok: true });
}
