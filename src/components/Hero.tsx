import type { Metric, Profile } from "@/data/content";
import { heroMedia, heroPortraitMedia } from "@/data/media";
import { HeroOpening } from "./hero/HeroOpening";
import { HeroPortrait } from "./hero/HeroPortrait";
import { HeroBridgeBand } from "./hero/HeroBridgeBand";
import { HeroMetrics } from "./hero/HeroMetrics";
import { TranslationPanel } from "./hero/TranslationPanel";

export function Hero({
  profile,
  metrics,
}: {
  profile: Profile;
  metrics: Metric[];
}) {
  return (
    <section id="top" className="relative">
      {/* the dither engine reads this from cache, so fetch it with the page;
          the portrait is above the fold too — each motion preference only
          fetches the still it will actually show */}
      <link rel="preload" as="image" href={heroMedia.image} />
      <link
        rel="preload"
        as="image"
        href={heroPortraitMedia.poster ?? heroPortraitMedia.image}
        media="(prefers-reduced-motion: no-preference)"
      />
      <link
        rel="preload"
        as="image"
        href={heroPortraitMedia.image}
        media="(prefers-reduced-motion: reduce)"
      />
      {/* the scrub holds the poster until the whole webm is buffered, so
          start that fetch as early as possible */}
      {heroPortraitMedia.video ? (
        <link rel="preload" as="video" href={heroPortraitMedia.video} type="video/webm" />
      ) : null}

      {/* the opening owns the first viewport; z-10 stacks it (and the
          clickable scroll cue) above the plate that slides up underneath —
          framer's entrance animations spawn stacking contexts, so the whole
          column has to lift as one unit, not a chip-level z-index */}
      <div className="relative z-10 mx-auto w-full max-w-content px-5 sm:px-8">
        {/* the crest peeks above the fold — that peek is the scroll cue's
            payoff. data-hero-viewport: the portrait scrub measures this block,
            not the whole section — the figure is gone after ~one viewport */}
        <div
          data-hero-viewport=""
          className="flex min-h-[88svh] flex-col lg:flex-row lg:items-center lg:gap-x-12"
        >
          <HeroOpening
            openTo={profile.openTo}
            location={profile.location}
            tagline={profile.tagline}
            resumeFile={profile.resumeFile}
          />
          {/* anchored to the viewport, not the row: the headline column runs
              1000px+ tall, so bottom-of-row alignment shoves the head below
              the fold on short screens. The two numbers: 103svh parks the
              figure's crop edge 3svh below the fold, which lands the head
              15–24% down at load; -15svh is that 103svh minus the block's
              88svh, cancelling the overhang exactly so the figure contributes
              88svh and the row still sizes off the headline alone */}
          <HeroPortrait className="mt-8 flex-none self-end lg:mt-[calc(103svh-min(88vh,850px))] lg:-mb-[15svh] lg:self-start" />
        </div>
      </div>

      {/* full-bleed chapter plate; slides up under the scroll cue via its -mt */}
      <HeroBridgeBand />

      {/* metrics as a caption plate cutting across the plate's bottom edge */}
      <div className="relative z-10 mx-auto -mt-12 w-full max-w-content px-5 sm:-mt-16 sm:px-8">
        <HeroMetrics metrics={metrics} />
      </div>

      <div className="mx-auto w-full max-w-content px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-14">
        <TranslationPanel theBridge={profile.theBridge} />
      </div>
    </section>
  );
}
