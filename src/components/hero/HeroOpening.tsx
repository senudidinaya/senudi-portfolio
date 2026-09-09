"use client";

import { motion, type Variants } from "framer-motion";
import { useIntroGate } from "@/components/motion/Preloader";
import { Magnetic } from "@/components/motion/Magnetic";
import { HeroPortrait } from "./HeroPortrait";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const rise: Variants = {
  hidden: { y: "112%" },
  visible: (d: number) => ({
    y: "0%",
    transition: { duration: 0.8, ease: EASE, delay: d },
  }),
};

const fade: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (d: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: d },
  }),
};

const draw: Variants = {
  hidden: { scaleX: 0 },
  visible: (d: number) => ({
    scaleX: 1,
    transition: { duration: 0.9, ease: EASE, delay: d },
  }),
};

// Headline copy as per-line segment lists so the entrance can step word by
// word while each line keeps its original base delay — the cascade still
// clears before the tagline lands at 0.65 instead of running long.
const WORD_STEP = 0.05;

type Segment = { text: string; className?: string; em?: boolean };

const HEADLINE: { d: number; segments: Segment[] }[] = [
  {
    d: 0.18,
    segments: [
      { text: "I build the" },
      { text: "bridge", className: "lowercase text-bridge", em: true },
      { text: "between" },
    ],
  },
  { d: 0.3, segments: [{ text: "what the business needs", className: "text-warm" }] },
  {
    d: 0.42,
    segments: [{ text: "and" }, { text: "what engineering ships.", className: "text-cool" }],
  },
];

export function HeroOpening({
  openTo,
  location,
  tagline,
  resumeFile,
}: {
  openTo: string;
  location: string;
  tagline: string;
  resumeFile: string;
}) {
  // rendered visible in the server HTML (LCP fires at first paint); the
  // entrance only arms itself once the opaque intro overlay is up
  const { gated, introDone } = useIntroGate();

  return (
    <motion.div
      initial={false}
      animate={!gated || introDone ? "visible" : "hidden"}
      className="flex flex-1 flex-col"
    >
      {/* status row */}
      <motion.div variants={fade} custom={0.05} className="pt-24 sm:pt-28">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 font-mono text-xs uppercase tracking-[0.14em]">
          <span className="flex items-center gap-2.5 text-ink">
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bridge opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-bridge" />
            </span>
            {openTo}
          </span>
          <span className="text-muted">{location}</span>
        </div>
        <motion.div variants={draw} custom={0.15} className="mt-4 h-px origin-left bg-line" />
      </motion.div>

      {/* headline block. Below xl: a single flex column, unchanged from
          before — justify-center still vertically centres the group in the
          available flex-1 space. At xl: a two-column grid, portrait beside
          the copy instead of overlapping it. items-end bottom-aligns both
          columns' content within the row (which stretches to the block's
          full flex-1 height), so the CTA row and the portrait's bottom edge
          land in the same neighbourhood rather than the copy floating
          centred above a portrait anchored to the band. */}
      <div className="flex flex-1 flex-col justify-center py-10 sm:py-12 xl:grid xl:grid-cols-[1fr_380px] xl:items-start xl:gap-x-12">
        <div>
          {/* max-w-4xl keeps the ~20–24 char measure below xl, where this
              column runs the full content width. At xl the headline lives in
              the grid's 1fr column beside the portrait and should wrap to
              THAT width instead — max-w-none there, relying on the per-line
              masked spans to keep wrapping internally same as always. */}
          <h1 className="mt-6 max-w-4xl font-serif text-display-lg font-light uppercase tracking-display text-ink xl:max-w-none">
            {HEADLINE.map((line, i) => (
              <Line key={i} d={line.d} segments={line.segments} />
            ))}
          </h1>

          <motion.p
            variants={fade}
            custom={0.65}
            className="mt-7 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
          >
            {tagline}
          </motion.p>

          <motion.div
            variants={fade}
            custom={0.78}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 sm:gap-x-10 lg:mt-6"
          >
            <Magnetic>
              <CtaLink href="#work" label="See the work" arrow={"→"} />
            </Magnetic>
            <Magnetic>
              <CtaLink href={resumeFile} label="Download resume" arrow={"↓"} download />
            </Magnetic>
          </motion.div>
        </div>

        {/* Second grid column, xl and up only. self-stretch fills the
            column's own box to the full height of the row track, handing
            HeroPortrait a definite height to size itself from. */}
        <div className="hidden self-stretch xl:block">
          <HeroPortrait />
        </div>
      </div>
    </motion.div>
  );
}

// one headline line, split to words. Every word carries its OWN mask: these
// lines wrap into several rows at most widths, and a single line-level mask
// would slide one wrapped row up across another instead of revealing in place.
function Line({ d, segments }: { d: number; segments: Segment[] }) {
  let n = 0;
  return (
    <span className="block">
      {segments.map((seg, si) =>
        seg.text.split(" ").map((word, wi) => (
          <Word
            key={`${si}-${wi}`}
            delay={d + n++ * WORD_STEP}
            className={seg.className}
            em={seg.em}
          >
            {word}
          </Word>
        ))
      )}
    </span>
  );
}

// masked rise on entrance, lift on hover. The two live on different elements
// so they never fight over the same transform: framer drives the inner span,
// CSS drives the mask around it. Lifting the mask (rather than the glyph
// inside it) is what keeps the hover from shaving the word's top edge.
// pb/-mb gives descenders room inside the mask without touching the line box.
function Word({
  delay,
  className,
  em = false,
  children,
}: {
  delay: number;
  className?: string;
  em?: boolean;
  children: React.ReactNode;
}) {
  const Inner = em ? motion.em : motion.span;
  return (
    <>
      <span className="inline-block overflow-hidden pb-[0.09em] -mb-[0.09em] align-bottom transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-[0.07em]">
        <Inner variants={rise} custom={delay} className={`inline-block ${className ?? ""}`}>
          {children}
        </Inner>
      </span>{" "}
    </>
  );
}

function CtaLink({
  href,
  label,
  arrow,
  download = false,
}: {
  href: string;
  label: string;
  arrow: string;
  download?: boolean;
}) {
  return (
    <a
      href={href}
      download={download || undefined}
      className="group relative inline-flex items-center gap-2 pb-1.5 font-mono text-xs uppercase tracking-[0.2em] text-ink"
    >
      {label}
      <span
        aria-hidden="true"
        className={`transition-transform duration-300 ${
          download ? "group-hover:translate-y-0.5" : "group-hover:translate-x-1"
        }`}
      >
        {arrow}
      </span>
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-line" />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-ink transition-transform duration-300 group-hover:scale-x-100"
      />
    </a>
  );
}
