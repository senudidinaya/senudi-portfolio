import type { Project, SiteContent } from "@/data/content";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const flagshipOrder = [
  "Sales Pitstop",
  "Cultivator Intention Analyzer",
  "Chest X-Ray Pneumonia Screening — EfficientNet-B0",
  "StudyMate",
];

const flagshipDots = ["bg-bridge", "bg-bridge", "bg-cool", "bg-cool"];

function TimelineItem({
  dotClass,
  delay,
  children,
}: {
  dotClass: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <li className="relative">
      <span
        aria-hidden="true"
        className={`absolute top-7 -left-[38px] h-3 w-3 rounded-full ring-4 ring-bg sm:-left-[46px] ${dotClass}`}
      />
      <Reveal delay={delay}>{children}</Reveal>
    </li>
  );
}

function FoundationsCard({ foundations }: { foundations: Project[] }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
        2023 &ndash; 2024
      </span>
      <h3 className="mt-3 font-serif text-2xl font-light tracking-tight text-ink sm:text-3xl">
        Foundations
      </h3>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Where it started &mdash; teaching myself the .NET stack one small,
        end-to-end build at a time.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {foundations.map((f) => (
          <div key={f.title} className="rounded-xl bg-bg p-4">
            <h4 className="font-serif text-base font-light leading-snug text-ink">
              {f.title}
            </h4>
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
              {f.summary}
            </p>
            <ul className="mt-3 flex flex-wrap gap-1">
              {f.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded border border-line px-1.5 py-0.5 font-mono text-[0.65rem] text-muted"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group grid gap-6 rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-ink/20 sm:p-8 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          {project.timeframe}
        </span>
        <h3 className="mt-3 font-serif text-2xl font-light tracking-tight text-ink sm:text-3xl">
          {project.title}
        </h3>
        <p className="mt-2 text-sm text-muted">{project.kind}</p>

        {project.metric && (
          <div className="mt-6 inline-flex items-baseline gap-2 rounded-xl bg-bg px-4 py-3">
            <span className="font-serif text-3xl font-light text-cool">
              {project.metric.value}
            </span>
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
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-cool hover:underline"
          >
            {project.link.label} &rarr;
          </a>
        )}
      </div>

      <div>
        <p className="text-[0.98rem] leading-relaxed text-ink">
          {project.summary}
        </p>
        <ul className="mt-5 space-y-2.5">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-3 text-sm leading-relaxed text-muted">
              <span className="mt-[0.55rem] h-1 w-1 flex-none rounded-full bg-warm" />
              {h}
            </li>
          ))}
        </ul>
        <ul className="mt-6 flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="rounded-md border border-line px-2.5 py-1 font-mono text-xs text-muted"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </article>
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
  const flagships = flagshipOrder
    .map((title) => projects.find((p) => p.title === title))
    .filter((p): p is Project => Boolean(p));

  return (
    <section id="work" className="px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-content">
        <SectionHeading eyebrow="03 / Work" title="How I've grown" />

        <Reveal>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
            From teaching myself the .NET stack, to shipping for a global sales
            team, to publishing research, to building on my own &mdash; here is
            the path, in order.
          </p>
        </Reveal>

        <ol className="relative mt-12 space-y-6 border-l border-line pl-8 sm:pl-10">
          <TimelineItem dotClass="bg-cool" delay={0}>
            <FoundationsCard foundations={foundations} />
          </TimelineItem>

          {flagships.map((project, i) => (
            <TimelineItem
              key={project.title}
              dotClass={flagshipDots[i] ?? "bg-cool"}
              delay={(i + 1) * 80}
            >
              <ProjectCard project={project} />
            </TimelineItem>
          ))}
        </ol>

        {/* Publication */}
        <Reveal>
          <div className="mt-16">
            <h3 className="eyebrow">Publication</h3>
            <div className="mt-4 rounded-2xl border border-line bg-surface p-6 sm:p-8">
              <p className="font-serif text-lg font-light leading-snug text-ink sm:text-xl">
                {publication.title}
              </p>
              <p className="mt-4 text-sm text-muted">
                {publication.role} · {publication.venue} · {publication.date}
              </p>
              <a
                href={publication.doiUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs text-cool hover:underline"
              >
                DOI {publication.doi} &rarr;
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
