"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  type Variants,
} from "framer-motion";
import { useTheme } from "next-themes";
import { ThemeToggle } from "./ThemeToggle";
import { getLenis } from "./motion/SmoothScroll";
import type { Profile } from "@/data/content";

const links = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];

// the panel wipes down from the top edge; close reverses faster
const panel: Variants = {
  closed: {
    y: "-100%",
    transition: { duration: 0.35, ease: [0.76, 0, 0.24, 1] },
  },
  open: { y: "0%", transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } },
};

// section links rise out of their masks once the wipe has landed
const linkList: Variants = {
  closed: {},
  open: { transition: { delayChildren: 0.55, staggerChildren: 0.05 } },
};

const linkItem: Variants = {
  closed: {
    y: "115%",
    transition: { duration: 0.2, ease: [0.76, 0, 0.24, 1] },
  },
  open: { y: "0%", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

// same ordered-bayer + hash recipe as the preloader's noise strip
const BX = [0, 2, 1, 3];
const BY = [0, 2, 1, 3];

function flick(i: number, tick: number) {
  const s = Math.sin(i * 127.1 + tick * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

const pillClass =
  "rounded-full border border-ink bg-ink px-4 py-2 font-mono text-xs uppercase leading-none tracking-[0.14em] text-bg transition-colors hover:bg-transparent hover:text-ink";

export function Nav({ profile }: { profile: Profile }) {
  const [pastHero, setPastHero] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const lastY = useRef(0);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const noiseRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll();
  const { resolvedTheme } = useTheme();

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

  // while the overlay is open: page + Lenis locked, ESC closes, focus trapped
  // inside and handed back to the MENU button on close
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    getLenis()?.stop();
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const overlay = overlayRef.current;
      if (!overlay) return;
      const focusables = overlay.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])"
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
      getLenis()?.start();
      menuBtnRef.current?.focus();
    };
  }, [open]);

  // dither-noise strip in the overlay's corner: flickers ~0.3s on open, then
  // freezes; a single static frame under reduced motion
  useEffect(() => {
    if (!open) return;
    const cvs = noiseRef.current;
    const ctx = cvs?.getContext("2d");
    if (!cvs || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    cvs.width = Math.round(90 * dpr);
    cvs.height = Math.round(14 * dpr);
    ctx.scale(dpr, dpr);

    let tick = 0;
    const draw = () => {
      // read the palette per frame — on a theme flip this effect runs before
      // next-themes has swapped the class on <html>, so an eager read is stale
      const v = getComputedStyle(cvs).getPropertyValue("--ink").trim();
      ctx.clearRect(0, 0, 90, 14);
      ctx.fillStyle = v ? `rgb(${v.split(/\s+/).join(",")})` : "#000";
      for (let c = 0; c < 30; c++) {
        const x = c * 3 + 0.7;
        for (let r = 0; r < 4; r++) {
          const th = (BX[c & 3] * 4 + BY[r & 3] + 0.5) / 16;
          if (flick(c * 7 + r, tick) < th) ctx.fillRect(x, r * 3 + 1, 1.6, 2.6);
        }
      }
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;
    let t0 = 0;
    const frame = (now: number) => {
      if (!t0) t0 = now;
      if (reduced || now - t0 > 300) {
        draw();
        return;
      }
      if (now - last > 45) {
        last = now;
        tick++;
        draw();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [open, resolvedTheme]);

  // close first, then scroll — the html overflow lock has to lift before the
  // page can move, hence the deferrals
  const choose = (href: string) => {
    setOpen(false);
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.setTimeout(() => target.scrollIntoView(), 0);
      return;
    }
    window.setTimeout(() => {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(target, { offset: -80 });
      else target.scrollIntoView({ behavior: "smooth" });
    }, 400);
  };

  const phone = profile.phone.trim();
  const linkedinLabel = profile.linkedin.replace(/^https?:\/\/(www\.)?/, "");

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
        <nav className="relative mx-auto flex max-w-content items-center justify-between px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              ref={menuBtnRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 py-2 font-mono text-xs uppercase tracking-[0.2em] text-ink"
            >
              <span
                aria-hidden="true"
                className={`inline-block text-sm leading-none transition-transform duration-300 ${
                  open ? "rotate-45" : ""
                }`}
              >
                +
              </span>
              Menu
            </button>

            <ul className="hidden items-center gap-1 lg:flex">
              {links.map((l) => {
                const id = l.href.slice(1);
                return (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className={`group relative px-3 py-2 font-mono text-xs uppercase tracking-[0.2em] transition-colors ${
                        active === id ? "text-ink" : "text-muted hover:text-ink"
                      }`}
                    >
                      {l.label}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-3 bottom-0.5 h-px bg-ink transition-transform duration-300 ${
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
          </div>

          <a
            href="#top"
            className="dither-text absolute left-1/2 hidden -translate-x-1/2 select-none font-serif text-[0.85rem] font-semibold uppercase tracking-[0.12em] sm:block"
          >
            {profile.name}
          </a>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <a href={profile.resumeFile} download className={pillClass}>
              Resume
            </a>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            variants={panel}
            initial="closed"
            animate="open"
            exit="closed"
            className="tone-capture fixed inset-0 z-[70]"
          >
            <div
              data-lenis-prevent
              className="tone-invert flex h-full flex-col overflow-y-auto bg-bg text-ink"
            >
              {/* top row mirrors the bar positions so the swap feels seamless */}
              <div className="relative mx-auto flex w-full max-w-content shrink-0 items-center justify-between px-5 py-3.5 sm:px-8">
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 py-2 font-mono text-xs uppercase tracking-[0.2em] text-ink"
                >
                  <span aria-hidden="true" className="text-sm leading-none">
                    ✕
                  </span>
                  Close
                </button>

                <span
                  aria-hidden="true"
                  className="dither-text absolute left-1/2 hidden -translate-x-1/2 select-none font-serif text-base font-semibold uppercase tracking-[0.12em] sm:block"
                >
                  {profile.name}
                </span>

                <div className="flex items-center gap-1.5">
                  <ThemeToggle />
                  <a href={profile.resumeFile} download className={pillClass}>
                    Resume
                  </a>
                </div>
              </div>

              <motion.nav
                variants={linkList}
                aria-label="Sections"
                className="flex flex-1 flex-col items-center justify-center gap-1 px-5 py-8"
              >
                {links.map((l) => {
                  const id = l.href.slice(1);
                  const current = active === id;
                  return (
                    <div
                      key={l.href}
                      className="flex items-center justify-center gap-4 sm:gap-7"
                    >
                      <span
                        aria-hidden="true"
                        className={`font-mono text-xs tracking-[0.3em] text-ink transition-opacity duration-300 ${
                          current ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        +++
                      </span>
                      <span className="block overflow-hidden">
                        <motion.span variants={linkItem} className="block">
                          <a
                            href={l.href}
                            aria-current={current ? "true" : undefined}
                            onClick={(e) => {
                              e.preventDefault();
                              choose(l.href);
                            }}
                            className="menu-link block font-serif uppercase leading-[1.12] tracking-display text-ink"
                            style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)" }}
                          >
                            {l.label}
                          </a>
                        </motion.span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`font-mono text-xs tracking-[0.3em] text-ink transition-opacity duration-300 ${
                          current ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        +++
                      </span>
                    </div>
                  );
                })}
              </motion.nav>

              <div className="relative shrink-0 px-5 pb-12 pt-4 sm:px-8">
                <div className="flex flex-wrap items-start justify-center gap-x-14 gap-y-4 text-center font-mono">
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.25em] text-muted/60">
                      E-mail
                    </p>
                    <a
                      href={`mailto:${profile.email}`}
                      className="mt-1 inline-block text-xs uppercase tracking-[0.12em] text-ink underline-offset-4 hover:underline"
                    >
                      {profile.email}
                    </a>
                  </div>
                  {phone ? (
                    <div>
                      <p className="text-[0.62rem] uppercase tracking-[0.25em] text-muted/60">
                        Phone
                      </p>
                      <a
                        href={`tel:${phone.replace(/\s+/g, "")}`}
                        className="mt-1 inline-block text-xs uppercase tracking-[0.12em] text-ink underline-offset-4 hover:underline"
                      >
                        {phone}
                      </a>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[0.62rem] uppercase tracking-[0.25em] text-muted/60">
                        LinkedIn
                      </p>
                      <a
                        href={profile.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-xs uppercase tracking-[0.12em] text-ink underline-offset-4 hover:underline"
                      >
                        {linkedinLabel}
                      </a>
                    </div>
                  )}
                </div>

                <canvas
                  ref={noiseRef}
                  aria-hidden="true"
                  className="absolute bottom-4 left-5 h-[14px] w-[90px] sm:left-8"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
