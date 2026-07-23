"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";

const titleRise: Variants = {
  hidden: { y: "112%" },
  visible: {
    y: "0%",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
  },
};

// Chapter heading: hairline, "+++ 01 / ABOUT +++" marker, masked display
// title, and a huge outlined chapter numeral drifting behind it.
export function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // both ranges start at 0 so server and first client render agree
  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -80]);

  const marker = `+++ ${eyebrow.toUpperCase()} +++`;
  const index = eyebrow.split("/")[0].trim();

  return (
    <div ref={ref} className="relative">
      <div className="h-px bg-line" />
      <motion.span
        aria-hidden="true"
        style={{ y, WebkitTextStroke: "1.5px rgb(var(--line))" }}
        className="pointer-events-none absolute -top-14 right-0 select-none font-serif text-[clamp(7rem,18vw,13rem)] font-light leading-none text-transparent opacity-[0.16] sm:-top-20"
      >
        {index}
      </motion.span>

      <div className="relative pt-7 sm:pt-9">
        <motion.p
          className="marker"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {marker}
        </motion.p>
        <h2 className="mt-4 font-serif text-display-lg font-light uppercase tracking-display text-ink">
          {/* observe the mask, not the shifted span — a translated child is
              fully clipped, so it never intersects and would never reveal */}
          <motion.span
            className="block overflow-hidden pb-[0.09em] -mb-[0.09em]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
          >
            <motion.span className="block" variants={titleRise}>
              {title}
            </motion.span>
          </motion.span>
        </h2>
      </div>
    </div>
  );
}
