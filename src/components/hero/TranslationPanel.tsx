"use client";

import { motion, type Variants } from "framer-motion";
import type { Profile } from "@/data/content";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function TranslationPanel({ theBridge }: { theBridge: Profile["theBridge"] }) {
  return (
    <motion.div
      className="terminal-card max-w-3xl"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
      }}
    >
      <div className="double-rule flex items-baseline justify-between border-b border-line px-5 py-3.5 sm:px-6">
        <span className="font-serif text-base font-light uppercase tracking-[0.08em] text-ink">
          Translation
        </span>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted">
          [ LIVE ]
        </span>
      </div>

      <div className="grid gap-8 px-5 pb-7 pt-8 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-7 sm:px-6 sm:pb-8">
        <motion.div variants={fadeUp}>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-warm">
            The ask
          </span>
          <p className="mt-3 font-serif text-lg italic leading-snug text-ink">
            {theBridge.ask}
          </p>
        </motion.div>

        <div className="flex items-center gap-2 sm:w-24" aria-hidden="true">
          <motion.span
            className="h-px flex-1 origin-left bg-gradient-to-r from-warm via-bridge to-cool"
            variants={{
              hidden: { scaleX: 0 },
              visible: { scaleX: 1, transition: { duration: 0.9, ease: EASE, delay: 0.35 } },
            }}
          />
          <motion.span
            className="font-mono text-sm leading-none text-bridge"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.3, delay: 1.15 } },
            }}
          >
            {"→"}
          </motion.span>
        </div>

        <motion.div variants={fadeUp}>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-cool">
            The build
          </span>
          <p className="mt-3 text-[0.98rem] font-medium leading-snug text-ink">
            {theBridge.build}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
