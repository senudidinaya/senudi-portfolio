"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Nudges its child a few px toward the cursor and springs back on leave.
// Mouse only — touch and pen pointers are ignored.
export function Magnetic({
  children,
  className,
  strength = 0.25,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  if (reduceMotion) {
    return (
      <div className={className} style={{ display: "inline-block" }}>
        {children}
      </div>
    );
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setOffset({
      x: (e.clientX - rect.left - rect.width / 2) * strength,
      y: (e.clientY - rect.top - rect.height / 2) * strength,
    });
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ display: "inline-block" }}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
      animate={offset}
      transition={{ type: "spring", stiffness: 260, damping: 18, mass: 0.6 }}
    >
      {children}
    </motion.div>
  );
}
