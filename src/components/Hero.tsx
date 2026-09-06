import type { Metric, Profile } from "@/data/content";
import { heroMedia } from "@/data/media";
import { HeroOpening } from "./hero/HeroOpening";
import { HeroBridgeBand } from "./hero/HeroBridgeBand";
import { HeroMetrics } from "./hero/HeroMetrics";
import { HeroPortrait } from "./hero/HeroPortrait";

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

        {/* Portrait on the cream page beside the headline, NOT on the band.
            It positions itself against this container: its bottom anchor is
            96px above this container's bottom edge, which is exactly the
            band's top edge (the band pulls up over the content by its
            sm:-mt-24), and its right edge lands on this container's gutter.
            Nothing here clips, so the sticker's overhang is free. */}
        <HeroPortrait />
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
