import { NextRequest, NextResponse } from "next/server";
import { addReport, findAnswer, getQuestion, getResource } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ReportTargetType } from "@/lib/types";

const VALID_TARGET_TYPES: ReportTargetType[] = ["resource", "question", "answer"];
const SNAPSHOT_MAX_LENGTH = 200;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  // Same reasoning as every other write route: should never actually
  // trigger, but reportedByEmail is the whole point of gating this behind
  // sign-in (see docs/decisions.md's "gate writes, not reads") — fail
  // loudly rather than silently store an unattributed report.
  if (!session.user.email) {
    return NextResponse.json(
      { error: "Your Google account has no email on file." },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { targetType, targetId, reason } = body ?? {};

  if (!VALID_TARGET_TYPES.includes(targetType)) {
    return NextResponse.json({ error: "Invalid report target." }, { status: 400 });
  }
  if (!targetId?.trim()) {
    return NextResponse.json({ error: "Missing target id." }, { status: 400 });
  }
  if (!reason?.trim()) {
    return NextResponse.json(
      { error: "Say what's wrong with it." },
      { status: 400 }
    );
  }

  // Look up the real content to (a) confirm it still exists and (b) take
  // the text snapshot + a link back to it, stored on the report — see
  // Report's docstring in types.ts for why. Answers are embedded in their
  // question, not a top-level array, hence findAnswer instead of a
  // getAnswer.
  let targetSnapshot: string | undefined;
  let targetHref: string | undefined;
  if (targetType === "resource") {
    const resource = await getResource(targetId);
    targetSnapshot = resource?.title;
    if (resource) targetHref = `/courses/${resource.courseCode}`;
  } else if (targetType === "question") {
    const question = await getQuestion(targetId);
    targetSnapshot = question?.title;
    if (question) targetHref = `/ask/${question.id}`;
  } else {
    const found = await findAnswer(targetId);
    targetSnapshot = found?.answer.body;
    if (found) targetHref = `/ask/${found.question.id}`;
  }
  if (targetSnapshot === undefined || targetHref === undefined) {
    return NextResponse.json(
      { error: "That doesn't exist (anymore)." },
      { status: 404 }
    );
  }

  const report = await addReport({
    targetType,
    targetId,
    targetSnapshot: targetSnapshot.slice(0, SNAPSHOT_MAX_LENGTH),
    targetHref,
    reason,
    // Deliberately the real Google name, not the self-declared display
    // name override — see Report's docstring in types.ts.
    reportedBy: session.user.name ?? session.user.email,
    reportedByEmail: session.user.email,
  });
  return NextResponse.json(report, { status: 201 });
}
