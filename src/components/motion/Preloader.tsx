"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AnimatePresence, animate, motion } from "framer-motion";

const SEEN_KEY = "senudi_intro_seen";

function hasSeenIntro(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markIntroSeen(): void {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Storage unavailable (private mode, disabled, etc.) — the intro will
    // just replay next time, which is harmless.
  }
}

const IntroContext = createContext(false);

// Lets any descendant delay its own entrance animation until the curtain
// has started lifting (or immediately, when the preloader never plays).
export function useIntro() {
  return useContext(IntroContext);
}

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [introDone, setIntroDone] = useState(false);

  return (
    <IntroContext.Provider value={introDone}>
      <Preloader onLift={() => setIntroDone(true)} />
      {children}
    </IntroContext.Provider>
  );
}

function Preloader({ onLift }: { onLift: () => void }) {
  // null = not decided yet (render nothing either way, so server and the
  // first client render always agree — no hydration mismatch possible).
  // true = playing the full sequence. false = skipped entirely.
  const [show, setShow] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion || hasSeenIntro()) {
      setShow(false);
      onLift();
      return;
    }

    setShow(true);
    const controls = animate(0, 100, {
      duration: 1.4,
      ease: "easeInOut",
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => {
        // The curtain starts lifting now — introDone flips at this exact
        // moment, not when the lift animation finishes.
        setLoaded(true);
        onLift();
      },
    });

    return () => controls.stop();
    // Runs once on mount; onLift is a stable setState wrapper from the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!show) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  if (!show) return null;

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.body.style.overflow = "";
        markIntroSeen();
      }}
    >
      {!loaded && (
        <motion.div
          key="preloader"
          aria-hidden="true"
          className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-bg px-6 text-center text-ink"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          <p className="eyebrow">Senudi Rupasinghe</p>
          <p className="mt-4 max-w-md font-serif text-lg italic leading-snug text-ink sm:text-xl">
            Between what business needs and what engineering ships.
          </p>

          <span className="absolute bottom-8 right-8 font-mono text-xs tabular-nums text-muted">
            {String(count).padStart(3, "0")}
          </span>

          <div className="absolute inset-x-0 bottom-0 h-px bg-line">
            <div
              className="h-full origin-left bg-ink"
              style={{ transform: `scaleX(${count / 100})` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
