import type { Metric, Profile } from "@/data/content";

export function Hero({
  profile,
  metrics,
}: {
  profile: Profile;
  metrics: Metric[];
}) {
  return (
    <section id="top" className="relative overflow-hidden px-5 pt-28 sm:px-8 sm:pt-36">
      {/* faint blueprint grid, ambient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.4] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(var(--line)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--line)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-content">
        <div className="flex animate-fade-up flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tracking-tight">
          <span className="flex items-center gap-2 text-ink">
            <span
              className="h-1.5 w-1.5 flex-none rounded-full bg-bridge"
              aria-hidden="true"
            />
            {profile.openTo}
          </span>
          <span className="text-muted">{profile.location}</span>
        </div>

        <h1 className="mt-5 max-w-4xl font-serif text-[2.6rem] font-light leading-[1.05] tracking-[-0.02em] sm:text-6xl lg:text-7xl">
          <span className="animate-fade-up [animation-delay:60ms]">I build the </span>
          <span className="animate-fade-up italic text-bridge [animation-delay:120ms]">
            bridge
          </span>
          <span className="animate-fade-up [animation-delay:120ms]"> between</span>
          <br />
          <span className="animate-fade-up text-warm [animation-delay:180ms]">
            what the business needs
          </span>
          <span className="animate-fade-up [animation-delay:220ms]"> and </span>
          <span className="animate-fade-up text-cool [animation-delay:260ms]">
            what engineering ships.
          </span>
        </h1>

        <p className="mt-7 max-w-xl animate-fade-up font-sans text-base leading-relaxed text-muted [animation-delay:320ms] sm:text-lg">
          {profile.tagline}
        </p>

        {/* Signature: the translation panel */}
        <div className="mt-12 animate-fade-up [animation-delay:380ms]">
          <TranslationPanel profile={profile} />
        </div>

        <div className="mt-10 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:440ms]">
          <a
            href="#work"
            className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            See the work
          </a>
          <a
            href={profile.resumeFile}
            download
            className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface2"
          >
            Download resume &darr;
          </a>
        </div>

        {/* Metrics */}
        <dl className="mt-16 grid animate-fade-up grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line [animation-delay:520ms] sm:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="bg-surface px-5 py-6">
              <dt className="font-serif text-3xl font-light tracking-tight text-ink sm:text-4xl">
                {m.value}
              </dt>
              <dd className="mt-1.5 font-mono text-[0.68rem] uppercase leading-snug tracking-[0.12em] text-muted">
                {m.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function TranslationPanel({ profile }: { profile: Profile }) {
  return (
    <div className="grid max-w-3xl items-stretch gap-3 rounded-2xl border border-line bg-surface p-3 sm:grid-cols-[1fr_auto_1fr]">
      {/* Business side */}
      <div className="rounded-xl bg-bg px-5 py-5">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-warm">
          The ask
        </span>
        <p className="mt-2.5 font-serif text-lg italic leading-snug text-ink">
          {profile.theBridge.ask}
        </p>
      </div>

      {/* Connector */}
      <div className="flex items-center justify-center py-1 sm:flex-col sm:py-0">
        <div className="hidden h-full w-px origin-top animate-draw-line bg-gradient-to-b from-warm to-bridge sm:block" />
        <span className="rotate-90 font-mono text-lg text-bridge sm:rotate-0">
          &rarr;
        </span>
        <div className="hidden h-full w-px origin-bottom animate-draw-line bg-gradient-to-b from-bridge to-cool sm:block" />
      </div>

      {/* Technical side */}
      <div className="rounded-xl bg-bg px-5 py-5">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-cool">
          The build
        </span>
        <p className="mt-2.5 font-sans text-[0.98rem] font-medium leading-snug text-ink">
          {profile.theBridge.build}
        </p>
      </div>
    </div>
  );
}
