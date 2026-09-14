import { NextRequest, NextResponse } from "next/server";
import { migrateSeedCourses } from "@/lib/db";

// One-time migration trigger. Visit this URL once in a browser (with the
// key below) after deploying the sophomore/junior course update, to merge
// the new seed data into the live Turso store — see docs/decisions.md.
//
// DELETE THIS FILE after running it once. It's gated by a shared-secret
// query param, not real auth, and has no reason to stay live.
const MIGRATION_KEY = "waypoint-migrate-2y-2026";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== MIGRATION_KEY) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const result = await migrateSeedCourses();
  return NextResponse.json({ ok: true, ...result });
}
