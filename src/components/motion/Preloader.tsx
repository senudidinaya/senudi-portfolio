"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { MotionConfig } from "framer-motion";

const KEY = "senudi_intro_seen";
const PLAY_MS = 1400;
const LIFT_MS = 700;

const IntroContext = createContext<{ introDone: boolean; introPlaying: boolean }>({
  introDone: true,
  introPlaying: false,
});
const IntroSetContext = createContext<{
  markPlaying: () => void;
  markDone: () => void;
} | null>(null);

export function useIntro() {
  return useContext(IntroContext);
}

// For content that must be visible in the server HTML (LCP, no-JS) but should
// still play the entrance when the intro curtain is actually up: `gated` only
// flips while the opaque overlay covers the page, so the swap is invisible.
export function useIntroGate() {
  const { introDone, introPlaying } = useIntro();
  const [gated, setGated] = useState(false);
  useEffect(() => {
    if (introPlaying && !introDone) setGated(true);
  }, [introPlaying, introDone]);
  return { gated, introDone };
}

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [intro, setIntro] = useState({ introDone: false, introPlaying: false });
  const setters = useMemo(
    () => ({
      markPlaying: () => setIntro((s) => ({ ...s, introPlaying: true })),
      markDone: () => setIntro((s) => ({ ...s, introDone: true })),
    }),
    []
  );
  return (
    <IntroContext.Provider value={intro}>
      <IntroSetContext.Provider value={setters}>
        {/* keeps SSR markup identical for reduced-motion visitors; framer
            drops transform animations for them at runtime instead */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </IntroSetContext.Provider>
    </IntroContext.Provider>
  );
}

// decided once per page load — keeps dev strict-mode double effects from
// reading back the session flag this load just wrote
let shouldPlay: boolean | null = null;

const BX = [0, 2, 1, 3];
const BY = [0, 2, 1, 3];

function flick(i: number, tick: number) {
  const s = Math.sin(i * 127.1 + tick * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export function Preloader() {
  const setters = useContext(IntroSetContext);
  // the intro belongs to the public site only
  const onAdmin = usePathname()?.startsWith("/admin") ?? false;
  const [stage, setStage] = useState<"boot" | "playing" | "lifting" | "done">("boot");
  const noiseRef = useRef<HTMLCanvasElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onAdmin) {
      setters?.markDone();
      setStage("done");
      return;
    }
    if (shouldPlay === null) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let seen = "1";
      try {
        seen = sessionStorage.getItem(KEY) ?? "";
        sessionStorage.setItem(KEY, "1");
      } catch {
        // storage blocked — treat as seen
      }
      shouldPlay = !reduced && !seen;
    }

    if (!shouldPlay) {
      setters?.markDone();
      setStage("done");
      return;
    }

    setters?.markPlaying();
    setStage("playing");
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const cvs = noiseRef.current;
    const ctx = cvs?.getContext("2d") ?? null;
    const dpr = window.devicePixelRatio || 1;
    let ink = "#000";
    if (cvs && ctx) {
      cvs.width = Math.round(140 * dpr);
      cvs.height = Math.round(20 * dpr);
      ctx.scale(dpr, dpr);
      const v = getComputedStyle(cvs).getPropertyValue("--ink").trim();
      if (v) ink = `rgb(${v.split(/\s+/).join(",")})`;
    }

    let raf = 0;
    let liftTimer = 0;
    let lastNoise = 0;
    let tick = 0;
    const t0 = performance.now();

    function frame(now: number) {
      const t = now - t0;
      const p = Math.min(1, t / PLAY_MS);
      const shown = Math.floor(100 * (1 - (1 - p) * (1 - p)));
      if (countRef.current) {
        countRef.current.textContent = String(shown).padStart(3, "0");
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`;
      }

      if (ctx && now - lastNoise > 50) {
        lastNoise = now;
        tick++;
        ctx.clearRect(0, 0, 140, 20);
        ctx.fillStyle = ink;
        for (let c = 0; c < 46; c++) {
          const x = c * 3 + 0.7;
          for (let r = 0; r < 7; r++) {
            const th = (BX[c & 3] * 4 + BY[r & 3] + 0.5) / 16;
            if (flick(c * 7 + r, tick) < th) ctx.fillRect(x, r * 3, 1.6, 3.3);
          }
        }
      }

      if (t >= PLAY_MS) {
        if (countRef.current) countRef.current.textContent = "100";
        setters?.markDone();
        setStage("lifting");
        liftTimer = window.setTimeout(() => {
          document.documentElement.style.overflow = prevOverflow;
          setStage("done");
        }, LIFT_MS + 50);
        return;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(liftTimer);
      document.documentElement.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (stage === "done") return null;

  return (
    <div
      aria-hidden="true"
      className="intro-overlay fixed inset-0 z-[200] flex items-center justify-center bg-bg"
      style={
        stage === "lifting"
          ? {
              transform: "translateY(-100%)",
              transition: `transform ${LIFT_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`,
            }
          : undefined
      }
    >
      <noscript>
        <style>{`.intro-overlay{display:none}`}</style>
      </noscript>

      <div className="px-6 text-center">
        <p className="marker">+++ SENUDI RUPASINGHE +++</p>
        <p className="mt-5 font-serif text-xl italic text-ink sm:text-2xl">
          Between what business needs and what engineering ships.
        </p>
      </div>

      <canvas
        ref={noiseRef}
        className="absolute bottom-8 left-6 h-[20px] w-[140px] sm:left-10"
      />

      <div className="absolute bottom-8 right-6 flex items-center gap-3 sm:right-10">
        <div className="h-px w-24 bg-line">
          <div
            ref={barRef}
            className="h-px origin-left bg-ink"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
        <span ref={countRef} className="font-mono text-xs tabular-nums text-muted">
          000
        </span>
      </div>
    </div>
  );
}
