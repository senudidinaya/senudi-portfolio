import "server-only";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = { authed?: boolean };

const password = process.env.SESSION_SECRET ?? "";

export const sessionOptions: SessionOptions = {
  password,
  cookieName: "senudi_admin",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  },
};

export async function getSession() {
  return getIronSession<SessionData>(cookies(), sessionOptions);
}

export async function isAuthed() {
  if (!password || password.length < 32) return false;
  const session = await getSession();
  return session.authed === true;
}
