import type { Metric, Profile } from "@/data/content";
import { heroMedia } from "@/data/media";
import { HeroOpening } from "./hero/HeroOpening";
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
      {/* the dither engine reads this from cache, so fetch it with the page */}
      <link rel="preload" as="image" href={heroMedia.image} />

      <div className="mx-auto w-full max-w-content px-5 sm:px-8">
        {/* the opening owns the first viewport; the scroll cue pins to the fold */}
        <div className="flex min-h-[100svh] flex-col">
          <HeroOpening
            openTo={profile.openTo}
            location={profile.location}
            tagline={profile.tagline}
            resumeFile={profile.resumeFile}
          />
        </div>
        <HeroBridgeBand />
        <HeroMetrics metrics={metrics} />
      </div>

      <div className="mx-auto w-full max-w-content px-5 py-20 sm:px-8 sm:py-24">
        <TranslationPanel theBridge={profile.theBridge} />
      </div>
    </section>
  );
}
