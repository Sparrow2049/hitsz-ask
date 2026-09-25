import { NextResponse } from "next/server";
import { deleteStudyGroup, getStudyGroup } from "@/lib/db";
import { auth } from "@/lib/auth";
import { canManagePost } from "@/lib/utils";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  const studyGroup = await getStudyGroup(id);
  if (!studyGroup) {
    return NextResponse.json(
      { error: "Study session not found." },
      { status: 404 }
    );
  }
  if (!canManagePost(session, studyGroup.createdByEmail)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  await deleteStudyGroup(id);
  return NextResponse.json({ ok: true });
}
