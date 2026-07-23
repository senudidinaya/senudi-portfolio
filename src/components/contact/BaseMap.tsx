"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Magnetic } from "../motion/Magnetic";
import { land, lanka, lankaPoint, sphere, viewBox } from "./world-map";

// Always-dark cartographic plate that closes the site: a cropped orthographic
// globe of her corner of the world with Sri Lanka lit mint and pulsing. The
// paths are a static build-time asset (see scripts/make-map.mjs) — no d3/topojson
// ships to the client.

const MINT = "rgb(104, 200, 150)"; // dark-theme --bridge, hardcoded: the plate
// is always dark so the light theme's deep pine would not read as a glow.

const EASE = [0.22, 1, 0.36, 1] as const;

const [px, py] = lankaPoint;
// Label sits below-left of the point, joined by a short diagonal leader.
const leader = { x1: px, y1: py, x2: px - 64, y2: py + 40 };
const labelX = px - 72;
const labelY = py + 46;

export function BaseMap({ location }: { location: string }) {
  const reduce = useReducedMotion();
  const plateRef = useRef<HTMLDivElement>(null);
  const inView = useInView(plateRef, { once: true, amount: 0.35 });

  // Pause the perpetual CSS loops (drift + radar) whenever the plate leaves the
  // viewport — this observer can re-arm, unlike the once-only entrance above.
  const [offscreen, setOffscreen] = useState(false);
  useEffect(() => {
    const el = plateRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setOffscreen(!entry.isIntersecting),
      { rootMargin: "0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Once true, elements animate to their revealed state; reduce short-circuits
  // straight to it with no motion.
  const shown = reduce || inView;

  return (
    <Magnetic className="w-full" strength={0.015}>
      <div ref={plateRef} className="terminal-card relative aspect-[16/10] w-full overflow-hidden sm:aspect-[21/9]">
        {/* CASCADE TRAP: .terminal-card forces background transparent, so the
            fill lives on this inner layer, not on the framed element. */}
        <div className={`absolute inset-0 bg-ink dark:bg-surface ${offscreen ? "map-paused" : ""}`}>
          <svg
            viewBox={viewBox}
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label="Map of the Indian Ocean region with Sri Lanka highlighted — current base of operations"
          >
            <defs>
              {/* faint upper-left sheen — the globe shading in the reference */}
              <radialGradient id="basemap-globe" cx="34%" cy="28%" r="82%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
                <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>

            <g className="map-drift">
              <path d={sphere} fill="url(#basemap-globe)" />

              {/* muted land silhouettes, fill-only */}
              <motion.path
                d={land}
                className="fill-bg/20 dark:fill-ink/15"
                initial={false}
                animate={{ opacity: shown ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.9, ease: EASE }}
              />

              {/* Sri Lanka locks on ~0.4s after the land settles */}
              <motion.g
                initial={false}
                animate={{ opacity: shown ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.5, delay: 0.4, ease: EASE }}
              >
                <path
                  d={lanka}
                  fill={MINT}
                  style={{ filter: "drop-shadow(0 0 6px rgba(104, 200, 150, 0.65))" }}
                />
                {/* core dot */}
                <circle cx={px} cy={py} r={2} fill={MINT} />
                {/* perpetual radar rings (CSS keyframes; paused off-screen) */}
                <circle
                  className="radar-ring"
                  cx={px}
                  cy={py}
                  fill="none"
                  stroke={MINT}
                  strokeWidth={1.5}
                />
                <circle
                  className="radar-ring"
                  cx={px}
                  cy={py}
                  fill="none"
                  stroke={MINT}
                  strokeWidth={1.5}
                  style={{ animationDelay: "1.6s" }}
                />
                {/* one-shot lock-on burst on entrance */}
                <motion.circle
                  cx={px}
                  cy={py}
                  fill="none"
                  stroke={MINT}
                  strokeWidth={1.5}
                  initial={false}
                  animate={
                    shown && !reduce
                      ? { r: [3, 44], opacity: [0.6, 0] }
                      : { opacity: 0 }
                  }
                  transition={{ duration: 1.1, delay: 0.5, ease: "easeOut" }}
                />
              </motion.g>

              {/* label draws in after the lock-on */}
              <motion.g
                initial={false}
                animate={{ opacity: shown ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.6, delay: 0.9, ease: EASE }}
              >
                <line
                  x1={leader.x1}
                  y1={leader.y1}
                  x2={leader.x2}
                  y2={leader.y2}
                  className="stroke-bg/60 dark:stroke-ink/60"
                  strokeWidth={1}
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="end"
                  className="fill-bg/90 font-serif uppercase dark:fill-ink/90"
                  style={{ fontSize: 26, letterSpacing: "0.25em" }}
                >
                  Sri Lanka
                </text>
              </motion.g>
            </g>
          </svg>

          {/* caption chip — house FIG. recipe (paper label over the plate) */}
          <span className="pointer-events-none absolute bottom-3 left-3 z-10 sm:bottom-4 sm:left-4">
            <span className="bg-bg/85 px-2.5 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink">
              FIG. 05 &mdash; BASE OF OPERATIONS
            </span>
          </span>

          {/* meta line — theme-flipped like the label since the plate is dark */}
          <span className="pointer-events-none absolute bottom-3 right-3 z-10 text-right font-mono text-[0.6rem] uppercase tracking-[0.16em] text-bg/70 dark:text-ink/70 sm:bottom-4 sm:right-4">
            {location} &middot; 07.03&deg; N / 79.92&deg; E &middot; UTC+05:30
          </span>
        </div>
      </div>
    </Magnetic>
  );
}
