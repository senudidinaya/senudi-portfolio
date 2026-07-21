"use client";

import { motion, type Variants } from "framer-motion";
import { CountUp } from "@/components/motion/CountUp";
import { useIntro } from "@/components/motion/Preloader";
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
  // hold the stagger until the curtain lifts, then fire on inView as usual;
  // introDone is false on the server and at hydration, so markup stays stable
  const { introDone } = useIntro();

  return (
    <motion.dl
      className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pb-8 pt-6 sm:grid-cols-4"
      initial="hidden"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}
      {...(introDone ? { whileInView: "visible" as const, viewport: { once: true, amount: 0.25 } } : {})}
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
