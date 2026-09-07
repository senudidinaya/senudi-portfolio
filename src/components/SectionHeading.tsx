"use client";

import { motion, type Variants } from "framer-motion";

const titleRise: Variants = {
  hidden: { y: "112%" },
  visible: {
    y: "0%",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
  },
};

// Chapter heading: hairline + masked display title.
export function SectionHeading({ title }: { title: string }) {
  return (
    <div className="relative">
      <div className="h-px bg-line" />

      <div className="relative pt-7 sm:pt-9">
        <h2 className="font-serif text-display-lg font-light uppercase tracking-display text-ink">
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
