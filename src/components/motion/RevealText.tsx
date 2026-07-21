"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

type Tag = "span" | "p" | "h1" | "h2" | "h3" | "h4" | "div";

const container: Variants = {
  hidden: {},
  visible: ({ delay, stagger }: { delay: number; stagger: number }) => ({
    transition: { delayChildren: delay / 1000, staggerChildren: stagger / 1000 },
  }),
};

const word: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// Splits text into words, each masked by an overflow-hidden wrapper, and
// reveals them with a rise-up stagger the first time they scroll into view.
export function RevealText({
  children,
  as = "span",
  className = "",
  delay = 0,
  stagger = 40,
}: {
  children: string;
  as?: Tag;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduceMotion = useReducedMotion();
  const words = children.split(" ");

  if (reduceMotion) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={container}
      custom={{ delay, stagger }}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-top">
          <motion.span className="inline-block" variants={word}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
