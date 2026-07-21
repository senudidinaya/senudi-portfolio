"use client";

import { useRef, useState } from "react";
import { useTheme } from "next-themes";
import { DitherMedia, type DitherMediaHandle } from "@/components/dither/DitherMedia";
import { facets, heroMedia } from "@/data/media";

export function DitherLab() {
  const [cell, setCell] = useState(3);
  const [breathe, setBreathe] = useState(true);
  const [run, setRun] = useState(0);
  const { resolvedTheme, setTheme } = useTheme();
  const hoverRef = useRef<DitherMediaHandle>(null);

  return (
    <main className="min-h-screen bg-bg px-5 py-10 text-ink sm:px-8">
      <div className="mx-auto max-w-content space-y-12">
        <header className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <h1 className="font-mono text-sm uppercase tracking-[0.2em]">dither lab</h1>
          <label className="flex items-center gap-2 font-mono text-xs">
            cell {cell.toFixed(1)}px
            <input
              type="range"
              min={2}
              max={8}
              step={0.5}
              value={cell}
              onChange={(e) => setCell(Number(e.target.value))}
            />
          </label>
          <label className="flex items-center gap-2 font-mono text-xs">
            <input
              type="checkbox"
              checked={breathe}
              onChange={(e) => setBreathe(e.target.checked)}
            />
            breathe
          </label>
          <button
            type="button"
            className="border border-line px-3 py-1 font-mono text-xs"
            onClick={() => setRun((n) => n + 1)}
          >
            re-materialize
          </button>
          <button
            type="button"
            className="border border-line px-3 py-1 font-mono text-xs"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            toggle theme
          </button>
        </header>

        <section key={run} className="space-y-12">
          <figure>
            <DitherMedia
              src={heroMedia.image}
              alt={heroMedia.alt}
              cell={cell}
              breathe={breathe}
              className="aspect-[21/9] w-full"
            />
            <figcaption className="mt-2 font-mono text-xs text-muted">
              hero 21:9 full width
            </figcaption>
          </figure>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {facets.map((f) => (
              <figure key={f.key}>
                <DitherMedia
                  src={f.image}
                  alt={f.alt}
                  cell={cell}
                  breathe={breathe}
                  className="aspect-[2/3] w-full"
                />
                <figcaption className="mt-2 font-mono text-xs text-muted">
                  {f.label} — {f.caption}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-6">
            <figure>
              <DitherMedia
                src={facets[0].image}
                alt={facets[0].alt}
                cell={cell}
                className="aspect-[2/3] w-64"
              />
              <figcaption className="mt-2 font-mono text-xs text-muted">w-64</figcaption>
            </figure>
            <figure>
              <DitherMedia
                src={facets[1].image}
                alt={facets[1].alt}
                cell={cell}
                className="aspect-[2/3] w-40"
              />
              <figcaption className="mt-2 font-mono text-xs text-muted">w-40</figcaption>
            </figure>
            <figure>
              <DitherMedia
                src={facets[2].image}
                alt={facets[2].alt}
                cell={cell}
                className="aspect-[2/3] w-24"
              />
              <figcaption className="mt-2 font-mono text-xs text-muted">w-24</figcaption>
            </figure>
            <figure onMouseEnter={() => hoverRef.current?.scramble()}>
              <DitherMedia
                ref={hoverRef}
                src={facets[3].image}
                alt={facets[3].alt}
                cell={cell}
                className="aspect-[2/3] w-56"
              />
              <figcaption className="mt-2 font-mono text-xs text-muted">
                hover → scramble
              </figcaption>
            </figure>
          </div>

          <figure>
            <DitherMedia
              src={heroMedia.image}
              alt={heroMedia.alt}
              cell={cell}
              transition="none"
              className="aspect-[21/9] w-full max-w-lg"
            />
            <figcaption className="mt-2 font-mono text-xs text-muted">
              transition=&quot;none&quot;
            </figcaption>
          </figure>
        </section>
      </div>
    </main>
  );
}
