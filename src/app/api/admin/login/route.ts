import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSession } from "@/lib/session";
import {
  rateLimited,
  recordFailure,
  recordSuccess,
  verifyPassword,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip =
    headers().get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  let password = "";
  try {
    const body = await req.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    // ignore malformed body → treated as wrong password
  }

  const ok = await verifyPassword(password);
  if (!ok) {
    recordFailure(ip);
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  recordSuccess(ip);
  const session = await getSession();
  session.authed = true;
  await session.save();
  return NextResponse.json({ ok: true });
}
