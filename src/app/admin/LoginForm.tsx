"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <main className="mx-auto grid min-h-screen max-w-sm place-items-center px-6">
      <form
        onSubmit={onSubmit}
        className="w-full rounded-2xl border border-line bg-surface p-8 shadow-lg shadow-ink/5"
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
            className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink transition-colors focus:border-cool focus:outline-none"
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
