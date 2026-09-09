"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";

const BACKDROP_VIDEO = "/media/about-water.mp4";
// Also the <video poster>, so the reduced-motion still and the pre-decode
// frame are the same image and the swap is never visible.
const BACKDROP_POSTER = "/media/admin-water-poster.webp";

// Full-bleed water plate behind the card. Decoration only: aria-hidden, out of
// the tab order, and pointer-events-none so it can never eat a click.
function SignInBackdrop() {
  const reduceMotion = useReducedMotion();

  // useReducedMotion resolves after mount, so render the still until then —
  // otherwise a reduced-motion viewer gets a frame or two of playback.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const playVideo = mounted && !reduceMotion;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {playVideo ? (
        <video
          src={BACKDROP_VIDEO}
          poster={BACKDROP_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          src={BACKDROP_POSTER}
          alt=""
          decoding="async"
          className="h-full w-full object-cover"
        />
      )}
      {/* Legibility stack — night ground in both themes, then a vignette that
          pulls the corners down so the card sits in the calm centre. */}
      <div className="signin-scrim absolute inset-0" />
      <div className="signin-vignette absolute inset-0" />
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Sign-in failed.");
      }
    } catch {
      setError("Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-signin relative grid min-h-[100svh] place-items-center overflow-hidden px-6 py-10">
      <SignInBackdrop />

      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-line bg-surface/[0.94] p-8 shadow-2xl shadow-black/40 backdrop-blur-md"
      >
        <h1 className="font-serif text-2xl font-light tracking-tight text-ink">
          Admin
        </h1>
        <p className="mt-1.5 text-sm text-muted">Sign in to edit the site.</p>

        <label className="mt-6 block">
          <span className="eyebrow">Password</span>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-line bg-bg/80 px-4 py-3 text-sm text-ink transition-colors focus:border-bridge focus:outline-none focus:ring-2 focus:ring-bridge/30"
          />
        </label>

        {error && <p className="mt-3 text-sm text-warm">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-xl bg-ink px-6 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
