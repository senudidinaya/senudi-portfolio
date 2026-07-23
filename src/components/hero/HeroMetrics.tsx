"use client";

import { motion, type Variants } from "framer-motion";
import { CountUp } from "@/components/motion/CountUp";
import { useIntroGate } from "@/components/motion/Preloader";
import type { Metric } from "@/data/content";

const cell: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export function HeroMetrics({ metrics }: { metrics: Metric[] }) {
  // server HTML shows the values plainly; when the intro overlay is up the
  // grid remounts hidden (invisibly) and staggers in after the curtain
  const { gated, introDone } = useIntroGate();

  return (
    <motion.dl
      key={gated ? "gated" : "ssr"}
      className="grid grid-cols-2 gap-x-6 gap-y-8 border border-line bg-bg/95 px-5 py-6 sm:grid-cols-4 sm:px-7 sm:py-7"
      initial={gated ? "hidden" : false}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}
      {...(!gated || introDone ? { whileInView: "visible" as const, viewport: { once: true, amount: 0.25 } } : {})}
    >
      {metrics.map((m) => (
        <motion.div key={m.label} variants={cell} className="border-l border-line pl-4 sm:pl-5">
          <dt className="font-serif text-3xl font-light tracking-tight text-ink sm:text-4xl">
            {introDone ? <CountUp value={m.value} /> : m.value}
          </dt>
          <dd className="mt-2 font-mono text-[0.65rem] uppercase leading-snug tracking-[0.14em] text-muted">
            {m.label}
          </dd>
        </motion.div>
      ))}
    </motion.dl>
  );
}
