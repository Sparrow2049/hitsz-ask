import { NextResponse } from "next/server";
import { deleteResource, getResource, updateResource } from "@/lib/db";
import { auth } from "@/lib/auth";
import { canManagePost, isBlockedResourceUrl } from "@/lib/utils";
import { ResourceType } from "@/lib/types";

const VALID_TYPES: ResourceType[] = ["notes", "past-paper", "link", "repo"];

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  const resource = await getResource(id);
  if (!resource) {
    return NextResponse.json({ error: "Resource not found." }, { status: 404 });
  }
  if (!canManagePost(session, resource.addedByEmail)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  await deleteResource(id);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  const resource = await getResource(id);
  if (!resource) {
    return NextResponse.json({ error: "Resource not found." }, { status: 404 });
  }
  if (!canManagePost(session, resource.addedByEmail)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  const body = await req.json();
  const { title, type, url } = body ?? {};

  // Same validation as creating one — see POST /api/resources. courseCode
  // isn't accepted here at all (see updateResource's docstring in db.ts),
  // so there's nothing to re-validate for it.
  if (!title?.trim() || !url?.trim()) {
    return NextResponse.json(
      { error: "Title and URL are required." },
      { status: 400 }
    );
  }
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid resource type." }, { status: 400 });
  }
  if (isBlockedResourceUrl(url)) {
    return NextResponse.json(
      { error: "That link isn't allowed here." },
      { status: 400 }
    );
  }

  const updated = await updateResource(id, { title, type, url });
  return NextResponse.json(updated);
}
