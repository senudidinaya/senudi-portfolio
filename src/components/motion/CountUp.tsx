"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

type Parsed = {
  prefix: string;
  suffix: string;
  target: number;
  decimals: number;
  grouped: boolean;
};

// Content-driven metric values look like "97.8%", "6 mo", "1,155", "IEEE".
// Only the numeric portion animates; anything without a number renders as-is.
function parse(raw: string): Parsed | null {
  const match = raw.match(/^([^\d]*)([\d,]*\.?\d+)([^\d]*)$/);
  if (!match) return null;
  const [, prefix, numberPart, suffix] = match;
  const decimals = numberPart.includes(".") ? numberPart.split(".")[1].length : 0;
  const grouped = numberPart.includes(",");
  const target = parseFloat(numberPart.replace(/,/g, ""));
  if (Number.isNaN(target)) return null;
  return { prefix, suffix, target, decimals, grouped };
}

function format(value: number, { decimals, grouped }: Parsed) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouped,
  });
}

export function CountUp({
  value,
  duration = 1.4,
  className,
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  // Memoized so identity is stable across the re-renders CountUp's own
  // onUpdate triggers — otherwise the effect below would see a "new" parsed
  // value on every animation frame and keep restarting the tween.
  const parsed = useMemo(() => parse(value), [value]);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!parsed || reduceMotion || !inView) return;
    const controls = animate(0, parsed.target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: setDisplay,
    });
    return () => controls.stop();
  }, [inView, reduceMotion, parsed, duration]);

  if (!parsed) {
    return <span className={className}>{value}</span>;
  }

  if (reduceMotion) {
    return (
      <span className={className}>
        {parsed.prefix}
        {format(parsed.target, parsed)}
        {parsed.suffix}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {parsed.prefix}
      {format(display, parsed)}
      {parsed.suffix}
    </span>
  );
}
