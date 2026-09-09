import { workBackdrop } from "@/data/media";

// The sticky desk plate behind "How I've grown". Pinned to the viewport while
// the timeline scrolls over it, the same construction About and Contact use:
// a 100svh sticky frame here, and a `-mt-[100svh]` content wrapper in the
// section that pulls the copy back up on top of it.
//
// No motion and no client boundary — the section below is long and
// text-dense, so a drifting plate under a reading column would fight the copy.
// The scroll relationship the sticky frame creates is the whole effect.
export function WorkBackdrop() {
  return (
    <div className="sticky top-0 h-[100svh] overflow-hidden" aria-hidden="true">
      {/* The subject (the lit screen) sits left of centre and low in the
          frame. object-[35%_60%] keeps it in view when a tall viewport crops
          the sides, rather than centring on the empty black above it. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={workBackdrop.image}
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover object-[35%_60%]"
        loading="lazy"
        decoding="async"
      />

      {/* Legibility stack. Heavier than the About plate's 72% because this
          section is a long reading column rather than a few short paragraphs
          — the screen's glow sat directly under body copy and cost too much
          contrast. At 80% the monitor still reads as a lit shape in a dark
          room; it just stops competing with the type. Top and bottom ramps
          carry the plate into the sections either side. */}
      <div className="absolute inset-0 bg-bg/80" />
      <div className="absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-bg to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}
