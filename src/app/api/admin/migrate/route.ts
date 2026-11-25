import { NextRequest, NextResponse } from "next/server";
import { migrateSeedCourses } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isAdminSession } from "@/lib/utils";

// Brings the live store in line with seed.ts after the seed data changes —
// see migrateSeedCourses in db.ts for exactly what it does and doesn't touch.
//
// Admin-only: visit it in a browser while signed in with an account listed
// in ADMIN_EMAILS. (It used to be gated by a secret in the URL, which sat
// in the source code — a signed-in admin session needs no secret to leak.)
//
//   /api/admin/migrate?dryRun=1   shows what would change, writes nothing
//   /api/admin/migrate            applies it
//
// Safe to run more than once. DELETE THIS FILE once you've run it — it has
// no reason to stay live.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!isAdminSession(session)) {
    return NextResponse.json(
      { error: "Sign in with an admin account first." },
      { status: 403 }
    );
  }

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const result = await migrateSeedCourses({ dryRun });
  return NextResponse.json({ ok: true, ...result });
}
