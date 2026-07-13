import "server-only";
import bcrypt from "bcryptjs";

// Best-effort, per-instance login throttle. bcrypt's own cost already makes
// brute force slow; this adds a hard cap after repeated failures. For a
// single-admin site this is sufficient. (Serverless instances aren't shared,
// so a determined attacker could spread attempts — the strong password hash
// is the real protection.)
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX = 8;

export function rateLimited(key: string): boolean {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(key, { count: 0, first: now });
    return false;
  }
  return rec.count >= MAX;
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
  } else {
    rec.count += 1;
  }
}

export function recordSuccess(key: string): void {
  attempts.delete(key);
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) return false;
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}
