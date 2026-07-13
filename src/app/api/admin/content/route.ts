import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { isAuthed } from "@/lib/session";
import { writeContent } from "@/lib/db";
import { siteContentSchema } from "@/lib/schema";
import { CONTENT_TAG } from "@/lib/content";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = siteContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    await writeContent(parsed.data);
  } catch {
    return NextResponse.json(
      { error: "Could not save. Is the database connected?" },
      { status: 500 }
    );
  }

  revalidateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
