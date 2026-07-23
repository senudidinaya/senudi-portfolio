import type { Project, SiteContent } from "@/data/content";
import { SectionHeading } from "./SectionHeading";
import { MotionReveal } from "./motion/MotionReveal";
import { CountUp } from "./motion/CountUp";
import { Timeline, TimelineItem } from "./work/Timeline";
import { FoundationsStrip } from "./work/FoundationsStrip";

// Flagship cards render in the order they appear in the content data, which is
// controlled entirely from the admin panel (the ↑/↓ reorder buttons). No code
// change is needed to add, remove, or reorder a project.
const dotPalette = ["bg-bridge", "bg-bridge", "bg-cool", "bg-warm"];

function FoundationsCard({ foundations }: { foundations: Project[] }) {
  return (
    <div className="border border-line p-6 sm:p-8">
      <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
        2023 &ndash; 2024
      </span>
      <h3 className="mt-3 font-serif text-3xl font-light uppercase tracking-tight text-ink sm:text-4xl">
        Foundations
      </h3>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Where it started &mdash; teaching myself the .NET stack one small,
        end-to-end build at a time.
      </p>
      <FoundationsStrip items={foundations} />
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group grid gap-6 border border-line bg-transparent p-6 transition-colors duration-300 hover:bg-surface sm:p-8 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          {project.timeframe}
        </span>
        <h3 className="mt-3 font-serif text-3xl font-light uppercase tracking-tight text-ink sm:text-4xl">
          {project.title}
        </h3>
        <p className="mt-2 text-sm text-muted">{project.kind}</p>

        {project.metric && (
          <div className="mt-6 inline-flex items-baseline gap-2.5 border border-line px-4 py-3">
            <CountUp
              value={project.metric.value}
              className="font-serif text-3xl font-light text-cool"
            />
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted">
              {project.metric.label}
            </span>
          </div>
        )}

        {project.link && (
          <a
            href={project.link.href}
            target="_blank"
            rel="noreferrer"
            className="group/link mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-cool"
          >
            {project.link.label}
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover/link:translate-x-1"
            >
              {"→"}
            </span>
          </a>
        )}
      </div>

      <div>
        <p className="text-[0.98rem] leading-relaxed text-ink">{project.summary}</p>
        <ul className="mt-5 space-y-2.5">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-3 text-sm leading-relaxed text-muted">
              <span className="mt-[0.55rem] h-1 w-1 flex-none rounded-full bg-warm" />
              {h}
            </li>
          ))}
        </ul>
        <p className="mt-6 font-mono text-[0.65rem] uppercase leading-relaxed tracking-[0.14em] text-muted">
          {project.stack.join(" +++ ")}
        </p>
      </div>
    </article>
  );
}

function PublicationCard({
  publication,
}: {
  publication: SiteContent["publication"];
}) {
  return (
    <div className="terminal-card">
      <div className="double-rule flex items-baseline justify-between border-b border-line px-5 py-3.5 sm:px-6">
        <span className="font-serif text-base font-light uppercase tracking-[0.08em] text-ink">
          Publication
        </span>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted">
          [ {publication.date} ]
        </span>
      </div>
      <div className="px-5 pb-6 pt-7 sm:px-6 sm:pb-7">
        <p className="max-w-2xl font-serif text-lg font-light leading-snug text-ink sm:text-xl">
          {publication.title}
        </p>
        <p className="mt-3 text-sm text-muted">
          {publication.role} &middot; {publication.venue}
        </p>
        <a
          href={publication.doiUrl}
          target="_blank"
          rel="noreferrer"
          className="group relative mt-5 inline-flex items-center gap-2 pb-1 font-mono text-xs uppercase tracking-[0.16em] text-ink"
        >
          DOI {publication.doi}
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            {"→"}
          </span>
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-line" />
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-ink transition-transform duration-300 group-hover:scale-x-100"
          />
        </a>
      </div>
    </div>
  );
}

export function Projects({
  projects,
  publication,
}: {
  projects: Project[];
  publication: SiteContent["publication"];
}) {
  const foundations = projects.filter((p) => p.kind.includes(".NET foundation"));
  // Every non-foundation project is a flagship, shown in the admin-defined order.
  const flagships = projects.filter((p) => !p.kind.includes(".NET foundation"));

  return (
    <section id="work" className="px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-content">
        <SectionHeading eyebrow="03 / Work" title="How I've grown" />

        <MotionReveal>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
            From teaching myself the .NET stack, to shipping for a global sales
            team, to publishing research, to building on my own &mdash; here is
            the path, in order.
          </p>
        </MotionReveal>

        <Timeline>
          <TimelineItem dotClass="bg-cool">
            <FoundationsCard foundations={foundations} />
          </TimelineItem>

          {flagships.map((project, i) => (
            <TimelineItem
              key={project.title}
              dotClass={dotPalette[i % dotPalette.length]}
            >
              <ProjectCard project={project} />
            </TimelineItem>
          ))}
        </Timeline>

        <MotionReveal className="mt-16">
          <PublicationCard publication={publication} />
        </MotionReveal>
      </div>
    </section>
  );
}
