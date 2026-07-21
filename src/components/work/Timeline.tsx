"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { MotionReveal } from "@/components/motion/MotionReveal";

// Timeline spine: a hairline track with an ink progress line that draws as
// the section scrolls through the viewport.
export function Timeline({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLOListElement>(null);
  const [staticSpine, setStaticSpine] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.75", "end 0.5"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.5 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStaticSpine(true);
    }
  }, []);

  return (
    <ol ref={ref} className="relative mt-12 space-y-6 pl-8 sm:pl-10">
      <span aria-hidden="true" className="absolute left-0 top-0 h-full w-px bg-line" />
      {staticSpine ? (
        <span aria-hidden="true" className="absolute left-0 top-0 h-full w-px bg-ink" />
      ) : (
        <motion.span
          aria-hidden="true"
          style={{ scaleY }}
          className="absolute left-0 top-0 h-full w-px origin-top bg-ink"
        />
      )}
      {children}
    </ol>
  );
}

export function TimelineItem({
  dotClass,
  children,
}: {
  dotClass: string;
  children: React.ReactNode;
}) {
  return (
    <li className="relative">
      <motion.span
        aria-hidden="true"
        className={`absolute top-7 -left-[38px] h-3 w-3 rounded-full ring-4 ring-bg sm:-left-[46px] ${dotClass}`}
        initial={{ scale: 0.3, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      />
      <MotionReveal>{children}</MotionReveal>
    </li>
  );
}
