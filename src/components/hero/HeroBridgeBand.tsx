"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { DitherMedia, type DitherMediaHandle } from "@/components/dither/DitherMedia";
import { useIntro } from "@/components/motion/Preloader";
import { heroMedia } from "@/data/media";
import type { Tier } from "./particleTypes";

// three/@react-three/fiber (~150KB) must land in an async chunk, fetched
// only once the intro is done and the device has cleared tiering — never in
// the route's first-load JS
const HeroParticles = dynamic(
  () => import("./HeroParticles").then((m) => m.HeroParticles),
  { ssr: false, loading: () => null }
);

function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function detectLowPower(): boolean {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  const saveData = nav.connection?.saveData === true;
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarseSmall =
    window.matchMedia("(pointer: coarse)").matches &&
    window.matchMedia("(max-width: 820px)").matches;
  return saveData || cores <= 4 || coarseSmall;
}

function detectTier(): Exclude<Tier, "fallback"> {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  const saveData = nav.connection?.saveData === true;
  const cores = navigator.hardwareConcurrency ?? 4;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const largeViewport = window.matchMedia("(min-width: 1024px)").matches;
  if (cores >= 8 && finePointer && largeViewport && !saveData) return "high";
  if (cores >= 5 && finePointer) return "mid";
  return "low";
}

// The hero illustration as a full-bleed chapter plate the opening text
// physically touches. Full-bleed by construction (w-full on a gutterless
// section — no vw units, which would count the Windows scrollbar). The scroll
// prints the plate line-by-line and parts the aperture curtains so the colour
// blooms exactly as the reader arrives; the cursor then ripples it. The colour
// <img> is in the server HTML unconditionally so a crest that wins the LCP
// contest still paints at first paint — only the canvas/scrub/particle layer
// gates on the intro curtain lifting.
export function HeroBridgeBand() {
  const { introDone } = useIntro();
  const reduce = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const bandRef = useRef<HTMLDivElement>(null);
  const dither = useRef<DitherMediaHandle>(null);

  // seeded to fallback values — the WebGL/navigator probes below throw
  // during SSR prerender, so they can only ever run post-mount
  const [webglSupported, setWebglSupported] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const [tier, setTier] = useState<Tier>("fallback");
  const [glFailed, setGlFailed] = useState(false);
  const [plateReady, setPlateReady] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const low = detectLowPower();
    setLowPower(low);
    // low-power devices never reach useGL regardless of webglSupported —
    // skip probing entirely there, since creating (even a throwaway) WebGL
    // context has real, measurable main-thread cost under CPU throttling
    if (low) {
      setTier("fallback");
      return;
    }
    setWebglSupported(detectWebGL());
    setTier(detectTier());
  }, [reduce]);

  const useGL =
    introDone && !reduce && webglSupported && !lowPower && tier !== "fallback" && !glFailed;

  // a downgrade (context lost, or useGL simply flipping false) must always
  // restore full <img> opacity — never leave a transparent hero behind
  useEffect(() => {
    if (!useGL) setPlateReady(false);
  }, [useGL]);

  // parallax across the full pass through the viewport
  const { scrollYProgress: pass } = useScroll({
    target: bandRef,
    offset: ["start end", "end start"],
  });
  // translate only — a fractional upscale would moiré the Bayer line grid.
  // ±5% stays inside the 6% oversize on each edge, so no gap ever shows.
  const y = useTransform(pass, [0, 1], ["-5%", "5%"]);

  // entry: curtains open + the print resolves as the plate scrolls to centre
  const { scrollYProgress: entry } = useScroll({
    target: bandRef,
    offset: ["start end", "center center"],
  });
  const curtain = useTransform(entry, [0, 1], [1, 0]);

  // exit: 0 at the centred hero moment, rising to 1 as the band leaves —
  // `entry` maxes out and holds at the centred moment, so it can't drive
  // dispersal; this picks up right where `entry` ends
  const { scrollYProgress: exit } = useScroll({
    target: bandRef,
    offset: ["center center", "end start"],
  });

  // drive the scrub print from scroll; read the current value on mount so a
  // mid-page reload lands at the right print state instead of a blank plate
  useEffect(() => {
    if (reduce || useGL) return;
    const d = dither.current;
    if (!d) return;
    d.setProgress(entry.get());
    return entry.on("change", (p) => d.setProgress(p));
  }, [entry, introDone, reduce, useGL]);

  // the site's single cursor signature — internally inert until the colour locks
  useEffect(() => {
    if (reduce || useGL) return;
    const d = dither.current;
    if (!d) return;
    d.enableWake();
    return () => d.disableWake();
  }, [introDone, reduce, useGL]);

  const theme: "light" | "dark" = resolvedTheme === "dark" ? "dark" : "light";
  // the dither layer's own inner <img> carries the accessible name once it
  // mounts; the particle layer has no equivalent element, so in that branch
  // this <img> keeps it — opacity 0 still leaves it in the a11y tree, only
  // an actual dither takeover needs aria-hidden
  const hideImgA11y = introDone && !useGL;

  return (
    <div
      ref={bandRef}
      className="relative -mt-16 h-[52svh] w-full overflow-hidden sm:-mt-24 sm:h-[64svh]"
    >
      {/* oversize media layer — parallax by translate only */}
      <motion.div
        style={reduce ? undefined : { y }}
        className="absolute inset-x-0 top-[-6%] h-[112%]"
      >
        {/* colour plate in the server HTML (already <link rel=preload>ed). It
            carries the accessible name until the dither/particle layer mounts
            and takes it over, so screen readers never hear the figure twice.
            Stays fully opaque under the particle field until it's fully
            assembled — a sparse point cloud mid-scatter must never show the
            page through a coverage gap. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroMedia.image}
          alt={hideImgA11y ? "" : heroMedia.alt}
          aria-hidden={hideImgA11y || undefined}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={
            useGL
              ? {
                  opacity: plateReady ? 0 : 1,
                  transition: "opacity 380ms cubic-bezier(0.22, 1, 0.36, 1)",
                }
              : undefined
          }
        />
        {introDone && !useGL && (
          <DitherMedia
            ref={dither}
            mode="resolve"
            transition="scrub"
            src={heroMedia.image}
            video={heroMedia.video}
            alt={heroMedia.alt}
            cell={3}
            className="absolute inset-0 h-full w-full"
          />
        )}
        {useGL && (
          <HeroParticles
            exit={exit}
            tier={tier as Exclude<Tier, "fallback">}
            theme={theme}
            onReady={() => setPlateReady(true)}
            onContextLost={() => setGlFailed(true)}
          />
        )}
      </motion.div>

      {/* aperture: bg curtains meet at the text column and part as you scroll
          in. The width is a % of the band's own width (not vw) so a classic
          scrollbar can't skew the seam; +2rem matches the sm px-8 gutter.
          Below ~68rem they compute to zero and only the print plays. */}
      <motion.div
        aria-hidden="true"
        style={reduce ? { scaleX: 0 } : { scaleX: curtain }}
        className="absolute inset-y-0 left-0 w-[max(0px,calc((100%-68rem)/2+2rem))] origin-left bg-bg"
      />
      <motion.div
        aria-hidden="true"
        style={reduce ? { scaleX: 0 } : { scaleX: curtain }}
        className="absolute inset-y-0 right-0 w-[max(0px,calc((100%-68rem)/2+2rem))] origin-right bg-bg"
      />

      {/* figure caption — sits just clear of the metrics plate that laps the
          image's bottom edge */}
      <span className="absolute bottom-14 left-3 z-10 sm:bottom-20 sm:left-4">
        <span className="bg-bg/85 px-2.5 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink">
          FIG. 00 &mdash; THE BRIDGE
        </span>
      </span>
    </div>
  );
}
