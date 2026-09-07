"use client";

import { portraitMedia } from "@/data/media";

// Plain cutout — the particle treatment lives only on the band now. Just the
// frame and the image, with a CSS mask dissolving its bottom edge (the PNG's
// own alpha is fully opaque there — no baked fade to rely on); sizing and
// vertical position come from the grid column HeroOpening puts it in. The
// sticker used to live here too — it's now top-left of the hero content
// container instead, positioned in Hero.tsx.
export function HeroPortrait() {
  return (
    // the wiggle rides the outermost wrapper, not the <img> — the frame below
    // is an overflow-hidden crop guard the image exactly fills, so rotating
    // inside it would shave the corners
    <div className="relative w-[300px] origin-bottom motion-safe:hover:animate-wiggle xl:w-fit">
      {/* overflow-hidden here is a defensive crop guard, not a dissolve
          confinement — there's no field to contain any more, but the image
          is 4:5 and the frame matches, so this never actually crops it.

          The xl height is derived from the headline's type rather than the
          viewport: 6.17em of the display step is the distance from this
          column's top edge down to the ENGINEERING baseline, so the
          portrait's base lands on that baseline. It was clamp(380px,58vh,
          620px), which drifted ~215px against the headline between a 700px
          and a 1080px viewport — aligned on some screens, 176px low on
          others. xl:text-display-lg only supplies the em unit; there's no
          text in this box, and the explicit height means its line-height
          can't affect the frame. */}
      <div className="relative w-fit overflow-hidden xl:h-[6.17em] xl:text-display-lg">
        <img
          src={portraitMedia.image}
          alt={portraitMedia.alt}
          width={1044}
          height={1060}
          loading="lazy"
          decoding="async"
          className="block h-full w-auto object-contain object-bottom [mask-image:linear-gradient(to_bottom,black_97%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_97%,transparent_100%)]"
        />
      </div>
    </div>
  );
}
