"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import type { Profile } from "@/data/content";

const links = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];

export function Nav({ profile }: { profile: Profile }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-line bg-bg/85 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-content items-center justify-between px-5 py-3.5 sm:px-8">
        <a
          href="#top"
          className="font-mono text-sm font-medium tracking-tight text-ink"
        >
          {profile.name.split(" ")[0]}
          <span className="text-warm">.</span>
          <span className="text-muted">{profile.name.split(" ")[1]}</span>
        </a>

        <div className="flex items-center gap-1.5">
          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="rounded-full px-3.5 py-2 text-sm text-muted transition-colors hover:text-ink"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href={profile.resumeFile}
            download
            className="hidden rounded-full border border-ink/15 bg-ink px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 sm:inline-block"
          >
            Resume
          </a>

          <ThemeToggle />

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full border border-line md:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              {open ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 8h16M4 16h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-line bg-bg md:hidden">
          <ul className="mx-auto flex max-w-content flex-col px-5 py-2 sm:px-8">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-sm text-ink"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={profile.resumeFile}
                download
                onClick={() => setOpen(false)}
                className="block py-3 text-sm font-medium text-warm"
              >
                Download resume &darr;
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
