"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { getLenis } from "./motion/SmoothScroll";
import { links } from "./Nav";

// Fixed right-edge instrument rail (lg+ only). Ticks are derived from the nav
// links with a prologue prepended, so the two never drift. A pine needle
// tracks overall scroll; the active chapter comes from an IntersectionObserver.
// Mounted in page.tsx only — the root layout also wraps /admin, which gets no rail.
const chapters = [{ href: "#top", label: "Prologue" }, ...links];

export function ChapterRail() {
  const [active, setActive] = useState("top");
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // which chapter is crossing the middle of the viewport
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    chapters.forEach((c) => {
      const el = document.getElementById(c.href.slice(1));
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // match Nav.choose(): a bare scrollTo ignores CSS scroll-padding and lands
  // sections under the fixed header; lenis (or the native fallback) respects it
  const go = (href: string) => (e: React.MouseEvent) => {
    const el = document.querySelector<HTMLElement>(href);
    if (!el) return;
    e.preventDefault();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.scrollIntoView();
      return;
    }
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: -80 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Chapters"
      className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
    >
      <div className="relative flex flex-col items-end gap-3 pr-4">
        {chapters.map((c, i) => {
          const on = active === c.href.slice(1);
          return (
            <a
              key={c.href}
              href={c.href}
              onClick={go(c.href)}
              aria-current={on ? "true" : undefined}
              className="group flex items-center gap-2.5"
            >
              <span
                className={`font-mono text-[0.62rem] uppercase tracking-[0.3em] transition-colors duration-300 ${
                  on ? "text-ink" : "text-muted/50 group-hover:text-muted"
                }`}
              >
                {String(i).padStart(2, "0")} {c.label}
              </span>
              <span
                aria-hidden="true"
                className={`h-px transition-all duration-300 ${
                  on ? "w-6 bg-bridge" : "w-3 bg-line group-hover:w-4"
                }`}
              />
            </a>
          );
        })}

        {/* progress needle down the rail's right edge */}
        <span aria-hidden="true" className="absolute right-0 top-0 h-full w-px bg-line" />
        {!reduce && (
          <motion.span
            aria-hidden="true"
            style={{ scaleY: scrollYProgress }}
            className="absolute right-0 top-0 h-full w-px origin-top bg-bridge"
          />
        )}
      </div>
    </nav>
  );
}
