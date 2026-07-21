"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Project } from "@/data/content";

// Horizontal strip of the early .NET builds. Native scroll + snap everywhere;
// fine pointers additionally get framer drag with a hint above.
export function FoundationsStrip({ items }: { items: Project[] }) {
  const boundsRef = useRef<HTMLDivElement>(null);
  const [draggable, setDraggable] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (fine && !reduced) setDraggable(true);
  }, []);

  return (
    <div className="mt-6">
      {draggable && (
        <p
          aria-hidden="true"
          className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.25em] text-muted"
        >
          Hold &amp; drag {"→"}
        </p>
      )}
      <div
        ref={boundsRef}
        tabIndex={0}
        role="region"
        aria-label="Foundation projects"
        className={`overflow-x-auto pb-2 ${draggable ? "" : "snap-x snap-mandatory"}`}
      >
        <motion.div
          className={`flex w-max gap-4 ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
          drag={draggable ? "x" : false}
          dragConstraints={boundsRef}
          dragElastic={0.08}
        >
          {items.map((f) => (
            <div
              key={f.title}
              className={`w-[260px] flex-none border border-line p-4 ${
                draggable ? "" : "snap-start"
              }`}
            >
              <h4 className="font-serif text-base font-light leading-snug text-ink">
                {f.title}
              </h4>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
                {f.summary}
              </p>
              <p className="mt-3 font-mono text-[0.62rem] uppercase leading-relaxed tracking-[0.14em] text-muted">
                {f.stack.join(" +++ ")}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
