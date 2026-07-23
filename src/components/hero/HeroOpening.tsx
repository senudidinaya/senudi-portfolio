"use client";

import { motion, type Variants } from "framer-motion";
import { useIntroGate } from "@/components/motion/Preloader";
import { Magnetic } from "@/components/motion/Magnetic";

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

      {/* headline block */}
      <div className="flex flex-1 flex-col justify-center py-10 sm:py-12">
        <motion.p variants={fade} custom={0.1} className="marker">
          +++ PROLOGUE +++
        </motion.p>

        <h1 className="mt-6 font-serif text-display-lg font-light uppercase tracking-display text-ink">
          <Line d={0.18}>
            I build the <em className="lowercase text-bridge">bridge</em> between
          </Line>
          <Line d={0.3}>
            <span className="text-warm">what the business needs</span>
          </Line>
          <Line d={0.42}>
            and <span className="text-cool">what engineering ships.</span>
          </Line>
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
          className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4"
        >
          <Magnetic>
            <CtaLink href="#work" label="See the work" arrow={"→"} />
          </Magnetic>
          <Magnetic>
            <CtaLink href={resumeFile} label="Download resume" arrow={"↓"} download />
          </Magnetic>
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        variants={fade}
        custom={0.95}
        className="mb-6 flex w-min flex-col items-center gap-2"
      >
        <span className="bg-bg px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.3em] text-muted">
          Scroll
        </span>
        <span className="relative block h-10 w-px overflow-hidden bg-line" aria-hidden="true">
          <motion.span
            className="absolute left-0 top-0 h-full w-px bg-ink"
            animate={{ y: ["-100%", "100%"] }}
            transition={{
              duration: 2.2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 0.4,
              delay: 1.8,
            }}
          />
        </span>
      </motion.div>
    </motion.div>
  );
}

// one masked headline line; long lines may wrap inside the same mask on
// small screens and rise as a block
function Line({ d, children }: { d: number; children: React.ReactNode }) {
  return (
    <span className="block overflow-hidden pb-[0.09em] -mb-[0.09em]">
      <motion.span variants={rise} custom={d} className="block">
        {children}
      </motion.span>
    </span>
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
