"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { DitherMedia, type DitherMediaHandle } from "@/components/dither/DitherMedia";
import { useIntro } from "@/components/motion/Preloader";
import { heroMedia } from "@/data/media";

// The hero illustration as a full-bleed chapter plate the opening text
// physically touches. Full-bleed by construction (w-full on a gutterless
// section — no vw units, which would count the Windows scrollbar). The scroll
// prints the plate line-by-line and parts the aperture curtains so the colour
// blooms exactly as the reader arrives; the cursor then ripples it. The colour
// <img> is in the server HTML unconditionally so a crest that wins the LCP
// contest still paints at first paint — only the canvas/scrub layer gates on
// the intro curtain lifting.
export function HeroBridgeBand() {
  const { introDone } = useIntro();
  const reduce = useReducedMotion();
  const bandRef = useRef<HTMLDivElement>(null);
  const dither = useRef<DitherMediaHandle>(null);

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

  // drive the scrub print from scroll; read the current value on mount so a
  // mid-page reload lands at the right print state instead of a blank plate
  useEffect(() => {
    if (reduce) return;
    const d = dither.current;
    if (!d) return;
    d.setProgress(entry.get());
    return entry.on("change", (p) => d.setProgress(p));
  }, [entry, introDone, reduce]);

  // the site's single cursor signature — internally inert until the colour locks
  useEffect(() => {
    if (reduce) return;
    const d = dither.current;
    if (!d) return;
    d.enableWake();
    return () => d.disableWake();
  }, [introDone, reduce]);

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
            carries the accessible name until the dither layer mounts and takes
            it over, so screen readers never hear the figure twice. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroMedia.image}
          alt={introDone ? "" : heroMedia.alt}
          aria-hidden={introDone || undefined}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {introDone && (
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
