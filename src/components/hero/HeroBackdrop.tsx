"use client";

import { DitherMedia } from "@/components/dither/DitherMedia";
import { useIntro } from "@/components/motion/Preloader";
import { heroMedia } from "@/data/media";

// The dithered landscape behind the hero type. Mounted once the intro curtain
// lifts, so the materialize plays in view instead of behind the preloader.
export function HeroBackdrop() {
  const { introDone } = useIntro();

  return (
    <div aria-hidden="true" className="absolute inset-0">
      {introDone && (
        <DitherMedia
          src={heroMedia.image}
          video={heroMedia.video}
          alt=""
          breathe
          autoContrast={false}
          className="h-full w-full"
        />
      )}
      {/* legibility: full wash + soft top/bottom dissolves into the page */}
      <div className="absolute inset-0 bg-bg/30 dark:bg-bg/40" />
      <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-bg to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}
