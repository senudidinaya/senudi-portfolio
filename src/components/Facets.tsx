"use client";

import { useRef, useState } from "react";
import { facets } from "@/data/media";
import type { DitherMediaHandle } from "@/components/dither/DitherMedia";
import { FacetCard } from "./FacetCard";

// Closing band of the About chapter, reframed as an INDEX + CONTACT SHEET.
// On lg+ a mono index rail on the left drives the four dithered studies on the
// right: hovering (or focusing) a row scrambles its card, ripples the
// neighbours, and washes the rest back — hovering a card lights its row. Below
// lg it collapses to the original snap strip. Content comes from media.ts.

// 12-col asymmetric cluster (4 + 3 + 3 + 2), top edges staggered so the row
// never reads as a flat grid line; card 1 rises above the cluster's top edge.
const CLUSTER = [
  "lg:col-span-4 lg:-mt-6",
  "lg:col-span-3 lg:mt-10",
  "lg:col-span-3",
  "lg:col-span-2 lg:mt-10",
];

function finePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export function Facets() {
  const handles = useRef<(DitherMediaHandle | null)[]>([]);
  const cooldown = useRef<number[]>([0, 0, 0, 0]);
  const clearTimer = useRef<number>(0);
  const [active, setActive] = useState<number | null>(null);

  // one scramble per card at most every 700ms, so pointer jitter along the
  // rail can't machine-gun the same card
  function scramble(i: number, dur: number) {
    const now = performance.now();
    if (now - cooldown.current[i] < 700) return;
    cooldown.current[i] = now;
    handles.current[i]?.scramble(dur);
  }

  function activate(i: number) {
    window.clearTimeout(clearTimer.current);
    setActive(i);
    scramble(i, 400);
    handles.current[i]?.playVideo();
    // neighbours ripple outward, each delayed by its distance from the source
    facets.forEach((_, j) => {
      if (j === i) return;
      const dist = Math.abs(j - i);
      window.setTimeout(() => scramble(j, 250), dist * 60);
    });
  }

  function deactivate(i: number) {
    handles.current[i]?.pauseVideo();
    // small grace period so scanning between adjacent rows doesn't flash the veil
    window.clearTimeout(clearTimer.current);
    clearTimer.current = window.setTimeout(
      () => setActive((cur) => (cur === i ? null : cur)),
      80
    );
  }

  return (
    <div className="mt-14 sm:mt-16">
      <p className="marker">+++ IN HER ELEMENT +++</p>
      <div className="mt-4 h-px bg-line" />

      <div className="mt-8 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10">
        {/* index rail (lg+): each row drives its card and lights up when the
            matching card is hovered */}
        <nav aria-label="Four sides of Senudi" className="hidden lg:block">
          {facets.map((f, i) => (
            <button
              key={f.key}
              type="button"
              onMouseEnter={() => {
                if (finePointer()) activate(i);
              }}
              onMouseLeave={() => deactivate(i)}
              onFocus={() => activate(i)}
              onBlur={() => deactivate(i)}
              className="block w-full border-t border-line py-4 text-left first:border-t-0"
            >
              <span className="font-mono text-xs uppercase tracking-[0.18em]">
                <span className="text-muted">{String(i + 1).padStart(2, "0")}</span>{" "}
                <span className="relative inline-block text-ink">
                  {f.label.toUpperCase()}
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-ink transition-transform duration-300 ${
                      active === i ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </span>
              </span>
              <span className="mt-1.5 block font-serif text-sm italic text-muted">
                {f.caption}
              </span>
            </button>
          ))}
        </nav>

        {/* contact sheet: asymmetric cluster on lg+, snap strip below */}
        <div
          tabIndex={0}
          role="region"
          aria-label="Four sides of Senudi, illustrated"
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-12 lg:items-start lg:gap-4 lg:overflow-visible lg:pb-0"
        >
          {facets.map((f, i) => (
            <FacetCard
              key={f.key}
              facet={f}
              index={i}
              className={CLUSTER[i]}
              active={active === i}
              dimmed={active !== null && active !== i}
              onHandle={(h) => {
                handles.current[i] = h;
              }}
              onActivate={() => activate(i)}
              onDeactivate={() => deactivate(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
