"use client";

import { DitherMedia } from "@/components/dither/DitherMedia";
import { useIntro } from "@/components/motion/Preloader";
import { heroMedia } from "@/data/media";

// The hero illustration, framed just below the first fold. The frame mounts
// unconditionally at a fixed aspect ratio — zero layout shift — with a
// bg-surface fill so it never sits empty during SSR or while the preloader
// plays (.terminal-card itself is transparent). Once the curtain lifts the
// dither materializes in view, then resolves into the full-colour image.
export function HeroBridgeBand() {
  const { introDone } = useIntro();

  return (
    <div className="terminal-card mb-12 aspect-[16/9] sm:mb-16 sm:aspect-[21/9]">
      <div className="h-full w-full bg-surface">
        {introDone && (
          <DitherMedia
            mode="resolve"
            src={heroMedia.image}
            video={heroMedia.video}
            alt={heroMedia.alt}
            cell={3}
            className="h-full w-full"
          />
        )}
      </div>
    </div>
  );
}
