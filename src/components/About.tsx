import type { SiteContent } from "@/data/content";
import { SectionHeading } from "./SectionHeading";
import { MotionReveal } from "./motion/MotionReveal";
import { Facets } from "./Facets";

export function About({
  about,
  education,
  additional,
}: {
  about: SiteContent["about"];
  education: SiteContent["education"];
  additional: SiteContent["additional"];
}) {
  const [lead, ...rest] = about.paragraphs;

  return (
    <section id="about" className="px-5 py-28 sm:px-8 sm:py-40">
      <div className="mx-auto max-w-content">
        <SectionHeading eyebrow="01 / About" title="Who I am" />

        <div className="mt-14 sm:mt-20">
          {lead && (
            <MotionReveal>
              <p className="max-w-3xl font-serif text-2xl font-light leading-snug text-ink sm:text-3xl">
                {lead}
              </p>
            </MotionReveal>
          )}

          {rest.length > 0 && (
            <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12">
              {rest.map((p, i) => (
                <MotionReveal key={i} delay={i * 0.08}>
                  <p className="text-base leading-relaxed text-muted">{p}</p>
                </MotionReveal>
              ))}
            </div>
          )}

          <div className="mt-16 border-b border-line sm:mt-20">
            {education.map((e, i) => (
              <MotionReveal key={e.school} delay={i * 0.07}>
                <Row meta={e.timeframe}>
                  <p className="font-serif text-lg font-light text-ink">{e.credential}</p>
                  <p className="mt-1 text-sm text-muted">{e.school}</p>
                </Row>
              </MotionReveal>
            ))}
            <MotionReveal delay={education.length * 0.07}>
              <Row meta="Languages">
                <p className="font-serif text-lg font-light text-ink">
                  {additional.languages.join(" · ")}
                </p>
              </Row>
            </MotionReveal>
            <MotionReveal delay={(education.length + 1) * 0.07}>
              <Row meta="Beyond work">
                <p className="font-serif text-lg font-light text-ink">
                  {additional.activities.join(" · ")}
                </p>
              </Row>
            </MotionReveal>
          </div>
        </div>

        <Facets />
      </div>
    </section>
  );
}

function Row({ meta, children }: { meta: string; children: React.ReactNode }) {
  return (
    <div className="group border-t border-line transition-colors duration-300 hover:border-muted">
      <div className="grid grid-cols-[6.5rem_1fr] gap-4 py-5 transition-transform duration-300 group-hover:translate-x-2 sm:grid-cols-[11rem_1fr] sm:gap-8">
        <span className="pt-1 font-mono text-[0.65rem] uppercase leading-relaxed tracking-[0.18em] text-muted">
          {meta}
        </span>
        <div>{children}</div>
      </div>
    </div>
  );
}
