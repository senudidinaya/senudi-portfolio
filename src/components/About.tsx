"use client";

import { useRef } from "react";
import type { SiteContent } from "@/data/content";
import { SectionHeading } from "./SectionHeading";
import { MotionReveal } from "./motion/MotionReveal";
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

      {/* Light-theme seam softener. Anchored to the section's own top edge,
          not to the sticky plate's frame, so it travels away with the seam
          instead of parking at the top of the viewport for the rest of the
          scene. Absolute, so it adds nothing to the flow and the -mt-[100svh]
          below still measures against the backdrop. It sits above the plate
          and below the z-10 content, so it softens the photograph without
          touching the type. 22svh rather than a pixel count: the distance is
          a share of the viewport, which is what holds it from 375 to 1920,
          and it clears the "Who I am" heading at every width. */}
      <div
        aria-hidden="true"
        className="seam-fade-page pointer-events-none absolute inset-x-0 top-0 h-[22svh]"
      />

      <div className="relative z-10 -mt-[100svh]">
        <div className="mx-auto max-w-content px-5 py-16 sm:px-8 sm:py-24">
          <SectionHeading title="Who I am" />

          <div className="mt-10 sm:mt-12">
            {/* Below lg this is a single column and the photograph reads full
                width, after the lead paragraph — order-2 does that in both
                directions, since in flex-col it follows the paragraph and in
                lg:flex-row it lands in the right-hand column exactly as
                lg:order-2 did. gap-12 matches the mt-12 on the block below, so
                the photograph carries the same rhythm above and below as every
                other block here; lg:gap-10 overrides it for the side-by-side.
                The source is 859x583 (1.473:1, landscape), so at full column
                width it comes out 227–254px tall across phone widths — h-auto
                keeps the aspect honest and no max-height or object-position is
                needed. No filter here or on desktop: the colour is the asset's
                own. */}
            <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-10">
              <div className="relative order-2 w-full shrink-0 overflow-hidden motion-safe:hover:animate-wiggle lg:w-[32%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/media/swimmer.png"
                  alt="Senudi mid-stroke in a swimming pool, goggles on, breaking the surface in a burst of spray"
                  className="block h-auto w-full"
                />
              </div>

              {lead && (
                <MotionReveal>
                  <p className="max-w-3xl font-serif text-lg font-light leading-relaxed text-ink sm:text-xl lg:max-w-xl">
                    {lead}
                  </p>
                </MotionReveal>
              )}
            </div>

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
