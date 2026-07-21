"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Small ink ring easing behind the native cursor, growing over interactive
// elements. Fine pointers with hover only; never under reduced motion.
export function CursorRing() {
  const onAdmin = usePathname()?.startsWith("/admin") ?? false;
  const [enabled, setEnabled] = useState(false);
  const [over, setOver] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 320, damping: 28, mass: 0.55 });
  const sy = useSpring(y, { stiffness: 320, damping: 28, mass: 0.55 });

  useEffect(() => {
    const ok =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) return;
    setEnabled(true);

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as Element | null;
      setOver(
        !!t?.closest?.("a, button, input, textarea, select, [role='button']")
      );
    };
    const leave = () => {
      x.set(-100);
      y.set(-100);
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [x, y]);

  if (!enabled || onAdmin) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[220]"
    >
      <div
        className={`h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink/50 transition-transform duration-300 ${
          over ? "scale-[1.7]" : "scale-100"
        }`}
      />
    </motion.div>
  );
}
