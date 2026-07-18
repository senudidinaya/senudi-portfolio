"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project, SiteContent } from "@/data/content";

type Status = "idle" | "saving" | "saved" | "error";

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = arr.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

// ── Field primitives ──────────────────────────────────────────
const inputClass =
  "w-full rounded-lg border border-line bg-bg px-3.5 py-2.5 text-[0.95rem] text-ink transition-colors focus:border-cool focus:outline-none";

function Text({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} resize-y`}
      />
    </label>
  );
}

function RowButton({
  onClick,
  children,
  danger,
}: {
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border border-line px-2 py-1 text-xs transition-colors hover:bg-bg ${
        danger ? "text-warm" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function StringList({
  label,
  items,
  onChange,
  area,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  area?: boolean;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            {area ? (
              <textarea
                value={item}
                rows={2}
                onChange={(e) => {
                  const next = items.slice();
                  next[i] = e.target.value;
                  onChange(next);
                }}
                className={`${inputClass} resize-y`}
              />
            ) : (
              <input
                value={item}
                onChange={(e) => {
                  const next = items.slice();
                  next[i] = e.target.value;
                  onChange(next);
                }}
                className={inputClass}
              />
            )}
            <div className="flex flex-none gap-1 pt-1">
              <RowButton onClick={() => onChange(move(items, i, -1))}>↑</RowButton>
              <RowButton onClick={() => onChange(move(items, i, 1))}>↓</RowButton>
              <RowButton
                danger
                onClick={() => onChange(items.filter((_, k) => k !== i))}
              >
                ✕
              </RowButton>
            </div>
          </div>
        ))}
      </div>
      <RowButton onClick={() => onChange([...items, ""])}>+ Add</RowButton>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 sm:p-7">
      <h2 className="border-b border-line pb-3 font-serif text-2xl font-normal tracking-tight text-ink">
        {title}
      </h2>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

// ── Editor ────────────────────────────────────────────────────
export function AdminEditor({ initial }: { initial: SiteContent }) {
  const router = useRouter();
  const [data, setData] = useState<SiteContent>(initial);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // structuredClone keeps updates simple: mutate a draft, set the result.
  function update(mutator: (draft: SiteContent) => void) {
    setData((prev) => {
      const next = structuredClone(prev);
      mutator(next);
      return next;
    });
    setStatus("idle");
  }

  async function save() {
    setStatus("saving");
    setError("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Save failed.");
        setStatus("error");
        return;
      }
      setStatus("saved");
    } catch {
      setError("Save failed.");
      setStatus("error");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  const p = data.profile;

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <span className="font-mono text-sm text-ink">Site editor</span>
          <div className="flex items-center gap-2">
            {status === "saved" && (
              <span className="text-xs text-bridge">Saved ✓</span>
            )}
            {status === "error" && (
              <span className="text-xs text-warm">{error}</span>
            )}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:text-ink"
            >
              View site ↗
            </a>
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:text-ink"
            >
              Log out
            </button>
            <button
              type="button"
              onClick={save}
              disabled={status === "saving"}
              className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {status === "saving" ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-5 py-8">
        <Section title="Profile">
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="Name" value={p.name} onChange={(v) => update((d) => { d.profile.name = v; })} />
            <Text label="Headline" value={p.headline} onChange={(v) => update((d) => { d.profile.headline = v; })} />
            <Text label="Open to (status line)" value={p.openTo} onChange={(v) => update((d) => { d.profile.openTo = v; })} />
            <Text label="Location" value={p.location} onChange={(v) => update((d) => { d.profile.location = v; })} />
            <Text label="Email" value={p.email} onChange={(v) => update((d) => { d.profile.email = v; })} />
            <Text label="Phone" value={p.phone} onChange={(v) => update((d) => { d.profile.phone = v; })} />
            <Text label="LinkedIn URL" value={p.linkedin} onChange={(v) => update((d) => { d.profile.linkedin = v; })} />
            <Text label="GitHub URL" value={p.github} onChange={(v) => update((d) => { d.profile.github = v; })} />
            <Text label="Resume file path" value={p.resumeFile} onChange={(v) => update((d) => { d.profile.resumeFile = v; })} />
          </div>
          <Area label="Tagline" value={p.tagline} onChange={(v) => update((d) => { d.profile.tagline = v; })} />
          <StringList label="Roles" items={p.roles} onChange={(next) => update((d) => { d.profile.roles = next; })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Area label="Hero — the ask" value={p.theBridge.ask} onChange={(v) => update((d) => { d.profile.theBridge.ask = v; })} />
            <Area label="Hero — the build" value={p.theBridge.build} onChange={(v) => update((d) => { d.profile.theBridge.build = v; })} />
          </div>
        </Section>

        <Section title="Metrics">
          <div className="space-y-3">
            {data.metrics.map((m, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  <Text label="Value" value={m.value} onChange={(v) => update((d) => { d.metrics[i].value = v; })} />
                </div>
                <div className="flex-[2]">
                  <Text label="Label" value={m.label} onChange={(v) => update((d) => { d.metrics[i].label = v; })} />
                </div>
                <div className="flex flex-none gap-1 pb-2">
                  <RowButton onClick={() => update((d) => { d.metrics = move(d.metrics, i, -1); })}>↑</RowButton>
                  <RowButton onClick={() => update((d) => { d.metrics = move(d.metrics, i, 1); })}>↓</RowButton>
                  <RowButton danger onClick={() => update((d) => { d.metrics.splice(i, 1); })}>✕</RowButton>
                </div>
              </div>
            ))}
          </div>
          <RowButton onClick={() => update((d) => { d.metrics.push({ value: "", label: "" }); })}>+ Add metric</RowButton>
        </Section>

        <Section title="About">
          <StringList
            label="Paragraphs"
            items={data.about.paragraphs}
            area
            onChange={(next) => update((d) => { d.about.paragraphs = next; })}
          />
        </Section>

        <Section title="Skills">
          {(["business", "shared", "technical"] as const).map((key) => (
            <div key={key} className="rounded-xl border border-line bg-bg p-5">
              <Text
                label={`${key} — heading`}
                value={data.skills[key].label}
                onChange={(v) => update((d) => { d.skills[key].label = v; })}
              />
              <div className="mt-3">
                <StringList
                  label="Items"
                  items={data.skills[key].items}
                  onChange={(next) => update((d) => { d.skills[key].items = next; })}
                />
              </div>
            </div>
          ))}
        </Section>

        <Section title="Projects">
          <div className="space-y-4">
            {data.projects.map((proj, i) => (
              <ProjectCard
                key={i}
                project={proj}
                onChange={(mut) => update((d) => mut(d.projects[i]))}
                onMove={(dir) => update((d) => { d.projects = move(d.projects, i, dir); })}
                onRemove={() => update((d) => { d.projects.splice(i, 1); })}
              />
            ))}
          </div>
          <RowButton
            onClick={() =>
              update((d) => {
                d.projects.push({
                  title: "",
                  kind: "",
                  timeframe: "",
                  summary: "",
                  highlights: [],
                  stack: [],
                });
              })
            }
          >
            + Add project
          </RowButton>
        </Section>

        <Section title="Publication">
          <Area label="Title" value={data.publication.title} onChange={(v) => update((d) => { d.publication.title = v; })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="Role" value={data.publication.role} onChange={(v) => update((d) => { d.publication.role = v; })} />
            <Text label="Date" value={data.publication.date} onChange={(v) => update((d) => { d.publication.date = v; })} />
          </div>
          <Area label="Venue" value={data.publication.venue} onChange={(v) => update((d) => { d.publication.venue = v; })} rows={2} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="DOI" value={data.publication.doi} onChange={(v) => update((d) => { d.publication.doi = v; })} />
            <Text label="DOI URL" value={data.publication.doiUrl} onChange={(v) => update((d) => { d.publication.doiUrl = v; })} />
          </div>
        </Section>

        <Section title="Education">
          <div className="space-y-3">
            {data.education.map((e, i) => (
              <div key={i} className="rounded-xl border border-line bg-bg p-5">
                <div className="mb-2 flex justify-end gap-1">
                  <RowButton onClick={() => update((d) => { d.education = move(d.education, i, -1); })}>↑</RowButton>
                  <RowButton onClick={() => update((d) => { d.education = move(d.education, i, 1); })}>↓</RowButton>
                  <RowButton danger onClick={() => update((d) => { d.education.splice(i, 1); })}>✕</RowButton>
                </div>
                <Text label="Credential" value={e.credential} onChange={(v) => update((d) => { d.education[i].credential = v; })} />
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <Text label="School" value={e.school} onChange={(v) => update((d) => { d.education[i].school = v; })} />
                  <Text label="Timeframe" value={e.timeframe} onChange={(v) => update((d) => { d.education[i].timeframe = v; })} />
                </div>
              </div>
            ))}
          </div>
          <RowButton onClick={() => update((d) => { d.education.push({ school: "", credential: "", timeframe: "" }); })}>
            + Add education
          </RowButton>
        </Section>

        <Section title="Additional">
          <StringList label="Languages" items={data.additional.languages} onChange={(next) => update((d) => { d.additional.languages = next; })} />
          <StringList label="Beyond work" items={data.additional.activities} onChange={(next) => update((d) => { d.additional.activities = next; })} />
        </Section>

        <Section title="Contact form (EmailJS)">
          <div className="grid gap-4 sm:grid-cols-3">
            <Text label="Service ID" value={data.contact.emailjs.serviceId} onChange={(v) => update((d) => { d.contact.emailjs.serviceId = v; })} />
            <Text label="Template ID" value={data.contact.emailjs.templateId} onChange={(v) => update((d) => { d.contact.emailjs.templateId = v; })} />
            <Text label="Public Key" value={data.contact.emailjs.publicKey} onChange={(v) => update((d) => { d.contact.emailjs.publicKey = v; })} />
          </div>
        </Section>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  onChange,
  onMove,
  onRemove,
}: {
  project: Project;
  onChange: (mut: (p: Project) => void) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-line bg-bg p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">
          {project.title || "Untitled project"}
        </span>
        <div className="flex gap-1">
          <RowButton onClick={() => onMove(-1)}>↑</RowButton>
          <RowButton onClick={() => onMove(1)}>↓</RowButton>
          <RowButton danger onClick={onRemove}>✕</RowButton>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Title" value={project.title} onChange={(v) => onChange((p) => { p.title = v; })} />
          <Text label="Timeframe" value={project.timeframe} onChange={(v) => onChange((p) => { p.timeframe = v; })} />
        </div>
        <Text label="Kind" value={project.kind} onChange={(v) => onChange((p) => { p.kind = v; })} />
        <Area label="Summary" value={project.summary} onChange={(v) => onChange((p) => { p.summary = v; })} />
        <StringList label="Highlights" items={project.highlights} area onChange={(next) => onChange((p) => { p.highlights = next; })} />
        <StringList label="Stack" items={project.stack} onChange={(next) => onChange((p) => { p.stack = next; })} />

        {/* Optional metric */}
        {project.metric ? (
          <div className="rounded-lg border border-line p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">Metric</span>
              <RowButton danger onClick={() => onChange((p) => { delete p.metric; })}>Remove</RowButton>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Text label="Value" value={project.metric.value} onChange={(v) => onChange((p) => { if (p.metric) p.metric.value = v; })} />
              <Text label="Label" value={project.metric.label} onChange={(v) => onChange((p) => { if (p.metric) p.metric.label = v; })} />
            </div>
          </div>
        ) : (
          <RowButton onClick={() => onChange((p) => { p.metric = { value: "", label: "" }; })}>+ Add metric</RowButton>
        )}

        {/* Optional link */}
        {project.link ? (
          <div className="rounded-lg border border-line p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">Link</span>
              <RowButton danger onClick={() => onChange((p) => { delete p.link; })}>Remove</RowButton>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Text label="Label" value={project.link.label} onChange={(v) => onChange((p) => { if (p.link) p.link.label = v; })} />
              <Text label="URL" value={project.link.href} onChange={(v) => onChange((p) => { if (p.link) p.link.href = v; })} />
            </div>
          </div>
        ) : (
          <RowButton onClick={() => onChange((p) => { p.link = { href: "", label: "" }; })}>+ Add link</RowButton>
        )}
      </div>
    </div>
  );
}
