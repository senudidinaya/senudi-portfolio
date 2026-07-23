"use client";

import { useEffect, useRef } from "react";
import { motion, type Variants } from "framer-motion";
import { DitherMedia, type DitherMediaHandle } from "@/components/dither/DitherMedia";
import type { FacetMedia } from "@/data/media";

const appear: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    // slower per-card stagger so the four materialize as one left-to-right wave
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.14 },
  }),
};

function finePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

// A single contact-sheet card. The index rail owns the choreography; the card
// only surfaces its dither handle and reports its own hover/focus so the rail
// row can light up in sympathy. Everything visual here is transform/opacity —
// never a width change, which would trip the dither's ResizeObserver cascade.
export function FacetCard({
  facet,
  index,
  className,
  active = false,
  dimmed = false,
  onHandle,
  onActivate,
  onDeactivate,
}: {
  facet: FacetMedia;
  index: number;
  className?: string;
  active?: boolean;
  dimmed?: boolean;
  onHandle?: (h: DitherMediaHandle | null) => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
}) {
  const dither = useRef<DitherMediaHandle>(null);

  // surface the handle to the parent index so rail rows can drive this card
  useEffect(() => {
    onHandle?.(dither.current);
    return () => onHandle?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.figure
      className={`group w-[68vw] flex-none snap-start sm:w-[300px] lg:w-auto ${className ?? ""}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={appear}
      custom={index}
      tabIndex={0}
      onMouseEnter={() => {
        if (finePointer()) onActivate?.();
      }}
      onMouseLeave={() => onDeactivate?.()}
      // focus fires exactly what hover fires, and is NOT gated behind the
      // fine-pointer check — keyboard users get the full response
      onFocus={() => onActivate?.()}
      onBlur={() => onDeactivate?.()}
    >
      <div
        className={`relative transition-transform duration-500 ${active ? "-translate-y-2" : ""}`}
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
          {/* on-image label chip; the underline is driven by `active`, not
              group-hover, so a rail-driven activation lights it too */}
          <span className="absolute bottom-3 left-3 z-10">
            <span className="relative inline-block bg-bg/85 px-2.5 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink">
              {facet.label}
              <span
                aria-hidden="true"
                className={`absolute inset-x-2.5 bottom-1 h-px origin-left bg-ink transition-transform duration-300 ${
                  active ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </span>
          </span>
          {/* rack-focus veil: the other three cards wash back while one is
              active (opacity only) */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 z-20 bg-bg/40 transition-opacity duration-300 ${
              dimmed ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </div>
    </motion.figure>
  );
}
