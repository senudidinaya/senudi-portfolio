"use client";

import { portraitMedia } from "@/data/media";

// Plain cutout — the particle treatment lives only on the band now. Just the
// frame and the image (its bottom fade is baked into the PNG's alpha);
// sizing and vertical position come from the grid column HeroOpening puts it
// in. The sticker used to live here too — it's now top-left of the hero
// content container instead, positioned in Hero.tsx.
export function HeroPortrait() {
  return (
    <div className="relative w-[300px] xl:w-[496px]">
      {/* overflow-hidden here is a defensive crop guard, not a dissolve
          confinement — there's no field to contain any more, but the image
          is 4:5 and the frame matches, so this never actually crops it. */}
      <div className="relative xl:h-[620px] w-auto overflow-hidden">
        <img
          src={portraitMedia.image}
          alt={portraitMedia.alt}
          width={900}
          height={1125}
          loading="lazy"
          decoding="async"
          className="h-full w-auto object-contain object-top"
        />
      </div>
    </div>
  );
}
