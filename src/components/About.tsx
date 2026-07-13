import type { SiteContent } from "@/data/content";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

export function About({
  about,
  education,
  additional,
}: {
  about: SiteContent["about"];
  education: SiteContent["education"];
  additional: SiteContent["additional"];
}) {
  return (
    <section id="about" className="px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-content">
        <SectionHeading eyebrow="01 / About" title="Who I am" />

        <div className="mt-12 grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <Reveal className="space-y-6">
            {about.paragraphs.map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "font-serif text-xl font-light leading-relaxed text-ink sm:text-2xl"
                    : "text-base leading-relaxed text-muted"
                }
              >
                {p}
              </p>
            ))}
          </Reveal>

          <Reveal delay={120} className="space-y-10">
            <div>
              <h3 className="eyebrow">Education</h3>
              <ul className="mt-4 space-y-5">
                {education.map((e) => (
                  <li key={e.school} className="border-l-2 border-line pl-4">
                    <p className="font-sans text-sm font-semibold text-ink">
                      {e.credential}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">{e.school}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted">
                      {e.timeframe}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="eyebrow">Languages</h3>
                <ul className="mt-3 space-y-1.5">
                  {additional.languages.map((l) => (
                    <li key={l} className="text-sm text-muted">
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="eyebrow">Beyond work</h3>
                <ul className="mt-3 space-y-1.5">
                  {additional.activities.map((a) => (
                    <li key={a} className="text-sm text-muted">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
