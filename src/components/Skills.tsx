import type { SiteContent } from "@/data/content";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

function SkillColumn({
  label,
  items,
  accent,
  align = "left",
}: {
  label: string;
  items: string[];
  accent: "warm" | "cool" | "bridge";
  align?: "left" | "center";
}) {
  const dot =
    accent === "warm"
      ? "bg-warm"
      : accent === "cool"
      ? "bg-cool"
      : "bg-bridge";
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <h3
        className={`flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-ink ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {label}
      </h3>
      <ul className="mt-5 space-y-2.5">
        {items.map((item) => (
          <li
            key={item}
            className="text-[0.95rem] leading-snug text-muted"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Skills({ skills }: { skills: SiteContent["skills"] }) {
  return (
    <section id="skills" className="border-y border-line bg-surface px-5 py-28 sm:px-8 sm:py-40">
      <div className="mx-auto max-w-content">
        <SectionHeading eyebrow="02 / Skills" title="Two sides, one workflow" />

        <Reveal>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
            Business analysis on one side, software engineering on the other, and
            the data and architecture work that connects them.
          </p>
        </Reveal>

        <Reveal>
          <div className="mt-12 grid gap-12 md:grid-cols-3 md:gap-8">
            <SkillColumn
              label={skills.business.label}
              items={skills.business.items}
              accent="warm"
            />
            <div className="relative md:border-x md:border-line md:px-8">
              <SkillColumn
                label={skills.shared.label}
                items={skills.shared.items}
                accent="bridge"
                align="center"
              />
            </div>
            <SkillColumn
              label={skills.technical.label}
              items={skills.technical.items}
              accent="cool"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
