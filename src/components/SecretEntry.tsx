"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Typing a secret word anywhere on the page opens the admin login.
// The word itself is never in the code — only the SHA-256 of it is compared,
// supplied via NEXT_PUBLIC_SECRET_WORD_SHA256. This is a convenience shortcut;
// the login password is the actual security.
const TARGET = (process.env.NEXT_PUBLIC_SECRET_WORD_SHA256 ?? "").toLowerCase();
const MIN = 3;
const MAX = 32;
const IDLE_MS = 2000;

async function sha256(text: string) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function SecretEntry() {
  const router = useRouter();

  useEffect(() => {
    if (!TARGET || typeof window === "undefined" || !window.crypto?.subtle) {
      return;
    }

    let buffer = "";
    let last = 0;
    let cancelled = false;

    async function onKey(e: KeyboardEvent) {
      // Ignore while typing in a field.
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (e.key.length !== 1 || !/[a-z0-9]/i.test(e.key)) return;

      const now = Date.now();
      if (now - last > IDLE_MS) buffer = "";
      last = now;

      buffer = (buffer + e.key.toLowerCase()).slice(-MAX);

      // Compare every trailing slice so the word matches regardless of length.
      for (let len = Math.min(MAX, buffer.length); len >= MIN; len--) {
        const hash = await sha256(buffer.slice(-len));
        if (!cancelled && hash === TARGET) {
          buffer = "";
          router.push("/admin");
          return;
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
    };
  }, [router]);

  return null;
}
