"use client";

import { Fragment } from "react";
import { motion, type Variants } from "framer-motion";

const word: Variants = {
  hidden: { y: "115%" },
  visible: {
    y: "0%",
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

// Splits a line into words and rises each one out of an overflow mask,
// staggered, on first scroll into view.
export function RevealText({
  children,
  as: Tag = "span",
  className,
  delay = 0,
  stagger = 0.04,
}: {
  children: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const words = children.split(" ");

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };

  return (
    <Tag className={className}>
      <motion.span
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        {words.map((w, i) => (
          <Fragment key={i}>
            <span
              style={{
                display: "inline-block",
                overflow: "hidden",
                verticalAlign: "top",
                // room for descenders at tight display line-heights
                paddingBottom: "0.1em",
                marginBottom: "-0.1em",
              }}
            >
              <motion.span variants={word} style={{ display: "inline-block" }}>
                {w}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}
