"use client";

import { useRef } from "react";
import type { SiteContent } from "@/data/content";
import { SectionHeading } from "./SectionHeading";
import { MotionReveal } from "./motion/MotionReveal";
import { Facets } from "./Facets";
import { LaneBackdrop } from "./about/LaneBackdrop";

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
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full overflow-clip plate-dark bg-bg min-h-[100svh]"
    >
      <LaneBackdrop sectionRef={sectionRef} />

      <div className="relative z-10 -mt-[100svh]">
        <div className="mx-auto max-w-content px-5 py-16 sm:px-8 sm:py-24">
          <SectionHeading eyebrow="01 / About" title="Who I am" />

          <div className="mt-10 sm:mt-12">
            {lead && (
              <MotionReveal>
                <p className="max-w-3xl font-serif text-2xl font-light leading-snug text-ink sm:text-3xl">
                  {lead}
                </p>
              </MotionReveal>
            )}

            {rest.length > 0 && (
              <div className="relative mt-12">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-x-4 -inset-y-6 bg-bg/55 sm:-inset-x-6"
                />
                <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12">
                  {rest.map((p, i) => (
                    <MotionReveal key={i} delay={i * 0.08}>
                      <p className="text-base leading-relaxed text-muted">{p}</p>
                    </MotionReveal>
                  ))}
                </div>
              </div>
            )}

            <div className="relative mt-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-4 -inset-y-2 bg-bg/55 sm:-inset-x-6"
              />
              <div className="relative border-b border-line">
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
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-4 -inset-y-6 bg-bg/55 sm:-inset-x-6"
            />
            <div className="relative">
              <Facets />
            </div>
          </div>
        </div>
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
