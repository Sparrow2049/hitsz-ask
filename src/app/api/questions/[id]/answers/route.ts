import { NextRequest, NextResponse } from "next/server";
import { addAnswer, getQuestion } from "@/lib/db";
import { Role } from "@/lib/types";
import { ROLE_ORDER } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { body: answerBody, answeredBy, role } = body ?? {};

  if (!(await getQuestion(id))) {
    return NextResponse.json({ error: "Question not found." }, { status: 404 });
  }
  if (!answerBody?.trim()) {
    return NextResponse.json({ error: "Answer can't be empty." }, { status: 400 });
  }
  if (!ROLE_ORDER.includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const answer = await addAnswer(id, {
    body: answerBody,
    answeredBy,
    role: role as Role,
  });
  return NextResponse.json(answer, { status: 201 });
}
