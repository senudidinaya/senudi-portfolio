import type { SiteContent } from "@/data/content";
import { SectionHeading } from "./SectionHeading";
import { MotionReveal } from "./motion/MotionReveal";

function SkillColumn({
  number,
  label,
  items,
  accentClass,
}: {
  number: string;
  label: string;
  items: string[];
  accentClass: string;
}) {
  return (
    <div>
      <h3 className={`font-mono text-xs uppercase tracking-[0.18em] ${accentClass}`}>
        {number} / {label}
      </h3>
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item} className="font-serif text-lg font-light leading-snug text-ink">
            <span className="relative inline-block after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-300 after:content-[''] hover:after:scale-x-100">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Skills({ skills }: { skills: SiteContent["skills"] }) {
  const line =
    [...skills.business.items, ...skills.shared.items, ...skills.technical.items].join(
      "  +++  "
    ) + "  +++  ";

  return (
    <section
      id="skills"
      className="overflow-hidden border-y border-line bg-surface px-5 py-14 sm:px-8 sm:py-20"
    >
      <div className="mx-auto max-w-content">
        <SectionHeading eyebrow="02 / Skills" title="Two sides, one workflow" />

        <MotionReveal>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
            Business analysis on one side, software engineering on the other, and
            the data and architecture work that connects them.
          </p>
        </MotionReveal>
      </div>

      {/* full-bleed ticker of every skill in the three groups. w-screen +
          negative-margin centring reaches the viewport edges; the section's
          own overflow-hidden and the global overflow-x:clip absorb the
          ~half-scrollbar overshoot under classic Windows scrollbars (the
          marquee edges are always in motion, so it never reads). */}
      <div className="marquee mx-[calc(50%-50vw)] mt-14 w-screen overflow-hidden border-y border-line py-3.5">
        <div className="marquee-track flex w-max">
          <span className="whitespace-pre font-mono text-xs uppercase tracking-[0.25em] text-muted">
            {line}
          </span>
          <span
            aria-hidden="true"
            className="whitespace-pre font-mono text-xs uppercase tracking-[0.25em] text-muted"
          >
            {line}
          </span>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-content sm:mt-16">
        <MotionReveal>
          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            <SkillColumn
              number="01"
              label={skills.business.label}
              items={skills.business.items}
              accentClass="text-warm"
            />
            <div className="md:border-x md:border-line md:px-8">
              <SkillColumn
                number="02"
                label={skills.shared.label}
                items={skills.shared.items}
                accentClass="text-bridge"
              />
            </div>
            <SkillColumn
              number="03"
              label={skills.technical.label}
              items={skills.technical.items}
              accentClass="text-cool"
            />
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
