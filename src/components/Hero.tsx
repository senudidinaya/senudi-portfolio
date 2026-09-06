import type { Metric, Profile } from "@/data/content";
import { heroMedia } from "@/data/media";
import { HeroOpening } from "./hero/HeroOpening";
import { HeroBridgeBand } from "./hero/HeroBridgeBand";
import { HeroMetrics } from "./hero/HeroMetrics";

export function Hero({
  profile,
  metrics,
}: {
  profile: Profile;
  metrics: Metric[];
}) {
  return (
    <section id="top" className="relative">
      {/* the dither engine reads this from cache, so fetch it with the page */}
      <link rel="preload" as="image" href={heroMedia.image} />

      {/* the opening owns the first viewport; z-10 stacks it (and the
          clickable scroll cue) above the plate that slides up underneath —
          framer's entrance animations spawn stacking contexts, so the whole
          column has to lift as one unit, not a chip-level z-index */}
      <div className="relative z-10 mx-auto w-full max-w-content px-5 sm:px-8">
        {/* Decorative sticker, hung off the hero content container's own
            top-left corner — lg and up only, since below lg there's no
            gutter to hang off. 60% (108 of 180px) sits outside the
            container's left gutter (left:-108px puts the sticker's own
            right edge at +72px, 40% of its width, inside); z-10 guarantees
            it paints above HeroOpening's subtree regardless of the nested
            stacking contexts framer-motion's transforms create there.

            Vertical position is a fixed offset, not a measurement: the
            eyebrow ("+++ PROLOGUE +++") sits inside a flex-1 block that
            centres (below xl) or bottom-aligns (xl+) its content depending
            on leftover vertical space, so its exact position isn't a single
            CSS constant — but the chrome ABOVE it (the status row's own
            fixed-height padding/content/rule, then the headline block's own
            top padding) is fixed regardless of viewport height. top-8 (32px)
            plus the sticker's 180px height lands its bottom at 212px, a safe
            23px above the theoretical minimum possible top of the h1's first
            line (235px, from that same fixed chrome plus the eyebrow's own
            line height and its mt-6) — a bound that holds at every
            viewport height, since any extra centring/end-alignment slack
            only ever pushes the headline further DOWN, never up. For every
            realistic browser window at this width (viewport height under
            ~1080–1100px) that minimum IS the actual rendered position, so
            in practice this sits right at the eyebrow's own baseline, not
            just safely above the headline. */}
        <img
          src="/media/sticker-at-work.svg"
          alt=""
          aria-hidden="true"
          width={180}
          height={180}
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute top-8 z-10 hidden h-[180px] w-[180px] -left-[108px] -rotate-[8deg] drop-shadow-[0_4px_6px_rgba(141,84,36,0.28)] lg:block"
        />

        {/* the crest peeks above the fold — that peek is the scroll cue's
            payoff */}
        <div className="flex min-h-[88svh] flex-col">
          <HeroOpening
            openTo={profile.openTo}
            location={profile.location}
            tagline={profile.tagline}
            resumeFile={profile.resumeFile}
          />
        </div>
      </div>

      {/* full-bleed chapter plate; slides up under the scroll cue via its -mt */}
      <HeroBridgeBand />

      {/* metrics as a caption plate cutting across the plate's bottom edge */}
      <div className="relative z-10 mx-auto -mt-12 w-full max-w-content px-5 pb-16 sm:-mt-16 sm:px-8 sm:pb-24">
        <HeroMetrics metrics={metrics} />
      </div>
    </section>
  );
}
