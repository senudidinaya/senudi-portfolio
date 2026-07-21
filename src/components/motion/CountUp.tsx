"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

// prefix / numeric part / suffix, so "3+", "92%" and "LKR 40k" all work
const NUMBER = /^(\D*)(\d+(?:[.,]\d+)*)(\D*)$/;

// Counts a metric value up from zero when it scrolls into view. The value is
// server-rendered as-is, so no-JS visitors and reduced-motion users always
// see the real number; anything unparseable stays plain text.
export function CountUp({
  value,
  className,
  duration = 1.2,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const match = NUMBER.exec(value.trim());
    if (!match) return;

    const [, prefix, num, suffix] = match;
    const target = parseFloat(num.replace(/,/g, ""));
    const decimals = num.includes(".") ? num.split(".")[1].length : 0;
    const grouped = num.includes(",");

    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate(latest) {
        const n = grouped
          ? Math.round(latest).toLocaleString("en-US")
          : latest.toFixed(decimals);
        setDisplay(prefix + n + suffix);
      },
    });
    return () => controls.stop();
  }, [inView, reduceMotion, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display ?? value}
    </span>
  );
}
