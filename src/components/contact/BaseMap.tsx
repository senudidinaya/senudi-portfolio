"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Magnetic } from "../motion/Magnetic";
import { land, lanka, lankaPoint, sphere, viewBox } from "./world-map";

// Always-dark cartographic backdrop for the Contact scene: a cropped
// orthographic globe of her corner of the world with Sri Lanka lit mint and
// pulsing. The paths are a static build-time asset (see scripts/make-map.mjs)
// — no d3/topojson ships to the client. Sized by its parent (the section's
// sticky wrapper), not by itself.

const MINT = "rgb(104, 200, 150)"; // dark-theme --bridge, hardcoded: the plate
// is always dark so the light theme's deep pine would not read as a glow.

const EASE = [0.22, 1, 0.36, 1] as const;

// 220x220 CSS-pixel tile, tuned in real pixel space (unlike the map's own
// viewBox) so baseFrequency 0.85 lands at the intended grain scale. Repeated
// via background-repeat, so it reads as one uniform texture across the plate.
const GRAIN_TILE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='7' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E";

const GRAIN_STYLE = {
  backgroundImage: `url("${GRAIN_TILE}")`,
  backgroundRepeat: "repeat",
  backgroundSize: "220px 220px",
  opacity: 0.22,
} as const;

const [px, py] = lankaPoint;
// Label centers below the point; the leader is a short vertical tick.
const leader = { x1: px, y1: py + 6, x2: px, y2: py + 34 };
const labelY = py + 52;

export function BaseMap() {
  const reduce = useReducedMotion();
  const plateRef = useRef<HTMLDivElement>(null);
  // amount stays low: a section-sized plate can exceed ~2.85 viewports on
  // short-landscape phones, where a higher threshold would never resolve
  const inView = useInView(plateRef, { once: true, amount: 0.15 });

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
    <Magnetic className="absolute inset-0 h-full w-full" strength={0.015}>
      <div
        ref={plateRef}
        className={`absolute inset-0 h-full w-full ${offscreen ? "map-paused" : ""}`}
      >
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMax slice"
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

            {/* darkens from the pin outward — the lit area is where the
                content sits. r=950 (down from 1150) and the ramp front-loaded
                to 18-80% so the darkening actually lands on-screen instead of
                mostly past the visible edges */}
            <radialGradient
              id="basemap-vignette"
              cx={px}
              cy={py}
              r={950}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#000000" stopOpacity="0" />
              <stop offset="18%" stopColor="#000000" stopOpacity="0" />
              <stop offset="50%" stopColor="#000000" stopOpacity="0.75" />
              <stop offset="80%" stopColor="#000000" stopOpacity="0.97" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.98" />
            </radialGradient>
          </defs>

          <g className="map-drift">
            <path d={sphere} fill="url(#basemap-globe)" />

            {/* muted land silhouettes, fill-only */}
            <motion.path
              d={land}
              className="fill-ink/15"
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
                style={{
                  filter:
                    "drop-shadow(0 0 6px rgba(104, 200, 150, 0.65)) drop-shadow(0 0 30px rgba(104, 200, 150, 0.25))",
                }}
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

            {/* label draws in after the lock-on, centered below the point */}
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
                className="stroke-ink/60"
                strokeWidth={1}
              />
              <text
                x={px}
                y={labelY}
                textAnchor="middle"
                className="fill-ink/90 font-serif uppercase"
                style={{ fontSize: 16, letterSpacing: "0.18em" }}
              >
                Sri Lanka
              </text>
            </motion.g>

            {/* pin-anchored falloff; padded past the viewBox so the ±24px
                drift never uncovers an edge */}
            <rect
              x={-40}
              y={-40}
              width={1680}
              height={980}
              fill="url(#basemap-vignette)"
              pointerEvents="none"
            />
          </g>
        </svg>

        {/* static film grain, as a tiled CSS layer rather than an in-SVG
            filter: the map's own viewBox (1600x900 abstract units, scaled to
            fill the viewport) is not 1:1 with screen pixels, so a feTurbulence
            baseFrequency tuned for pixel space read 3-4x finer than intended
            here and anti-aliased away to nothing. The tile below is declared
            in real CSS pixels (220x220), so baseFrequency lands at the
            intended scale regardless of viewport size or the map's own scale
            factor. feTurbulence has no time input, so this never animates */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={GRAIN_STYLE} />
      </div>
    </Magnetic>
  );
}
