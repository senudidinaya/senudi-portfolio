"use client";

import { useRef } from "react";
import { motion, type Variants } from "framer-motion";
import { DitherMedia, type DitherMediaHandle } from "@/components/dither/DitherMedia";
import type { FacetMedia } from "@/data/media";

const appear: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

function finePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function FacetCard({ facet, index }: { facet: FacetMedia; index: number }) {
  const dither = useRef<DitherMediaHandle>(null);

  function wake() {
    if (!finePointer()) return;
    // longer than the default 150ms — the shimmer has to read before the
    // 0.7s resolve fade brings the colour back
    dither.current?.scramble(400);
    dither.current?.playVideo();
  }

  function rest() {
    dither.current?.pauseVideo();
  }

  return (
    <motion.figure
      className="group w-[68vw] flex-none snap-start sm:w-[300px] lg:w-auto"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={appear}
      custom={index}
      tabIndex={0}
      onMouseEnter={wake}
      onMouseLeave={rest}
      onFocus={wake}
      onBlur={rest}
    >
      <div className="relative aspect-[2/3] overflow-hidden border border-line">
        <DitherMedia
          ref={dither}
          mode="resolve"
          src={facet.image}
          video={facet.video}
          videoAutoPlay={false}
          alt={facet.alt}
          cell={2.5}
          className="absolute inset-0 h-full w-full"
        />
        <span className="absolute bottom-3 left-3">
          <span className="relative inline-block bg-bg/85 px-2.5 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink">
            {facet.label}
            <span
              aria-hidden="true"
              className="absolute inset-x-2.5 bottom-1 h-px origin-left scale-x-0 bg-ink transition-transform duration-300 group-hover:scale-x-100 group-focus-within:scale-x-100"
            />
          </span>
        </span>
      </div>
      <figcaption className="mt-3 font-serif text-sm italic text-muted">
        {facet.caption}
      </figcaption>
    </motion.figure>
  );
}
