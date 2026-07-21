"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, type Variants } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import type { Profile } from "@/data/content";

const links = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];

const menuList: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const menuItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Nav({ profile }: { profile: Profile }) {
  const [pastHero, setPastHero] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const lastY = useRef(0);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onScroll = () => {
      const y = window.scrollY;
      setPastHero(y > window.innerHeight * 0.8);
      if (!reduced) {
        if (y > lastY.current + 4 && y > 160) setHidden(true);
        else if (y < lastY.current - 4 || y <= 160) setHidden(false);
      }
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // track which chapter is crossing the middle of the viewport
  useEffect(() => {
    const ids = ["top", ...links.map((l) => l.href.slice(1))];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id === "top" ? null : entry.target.id);
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // scroll lock while the overlay menu is open
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* page progress, pinned above everything so it survives the bar hiding */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: scrollYProgress }}
        className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-ink"
      />

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color,backdrop-filter] duration-300 ${
          pastHero
            ? "border-b border-line bg-bg/80 backdrop-blur-md"
            : "border-b border-transparent"
        } ${hidden && !open ? "-translate-y-full" : "translate-y-0"}`}
      >
        <nav className="mx-auto flex max-w-content items-center justify-between px-5 py-3.5 sm:px-8">
          <a href="#top" className="font-serif text-lg font-light tracking-tight text-ink">
            {profile.name}
          </a>

          <div className="flex items-center gap-1.5">
            <ul className="hidden items-center gap-1 md:flex">
              {links.map((l) => {
                const id = l.href.slice(1);
                return (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className={`group relative px-3.5 py-2 font-mono text-xs uppercase tracking-[0.16em] transition-colors ${
                        active === id ? "text-ink" : "text-muted hover:text-ink"
                      }`}
                    >
                      {l.label}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-3.5 bottom-0.5 h-px bg-ink transition-transform duration-300 ${
                          active === id
                            ? "scale-x-100"
                            : "origin-left scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </a>
                  </li>
                );
              })}
            </ul>

            <a
              href={profile.resumeFile}
              download
              className="mr-1 hidden font-mono text-xs uppercase tracking-[0.16em] text-ink underline-offset-4 hover:underline sm:inline-block"
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
      </header>

      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-bg px-5 pb-12 pt-24 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <p className="marker">+++ MENU +++</p>
          <motion.ul
            className="mt-8 space-y-1"
            variants={menuList}
            initial="hidden"
            animate="visible"
          >
            {links.map((l) => (
              <motion.li key={l.href} variants={menuItem}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 font-serif text-4xl font-light uppercase tracking-display text-ink"
                >
                  {l.label}
                </a>
              </motion.li>
            ))}
            <motion.li variants={menuItem}>
              <a
                href={profile.resumeFile}
                download
                onClick={() => setOpen(false)}
                className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.2em] text-warm"
              >
                Download resume {"↓"}
              </a>
            </motion.li>
          </motion.ul>
        </motion.div>
      )}
    </>
  );
}
