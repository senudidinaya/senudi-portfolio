"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

// Breaststroke curve: progress -> fraction of travel, in three surge/glide
// cycles (surge = big fraction jump over a small slice of progress, glide =
// the opposite). Strictly monotonic and ends exactly at 1 — this shape is
// what reads as a stroke rather than a conveyor-belt drift.
const PROGRESS = [0, 0.05, 0.09, 0.33, 0.38, 0.42, 0.66, 0.71, 0.75, 1.0];
const TRAVEL_FRACTION = [0, 0.16, 0.24, 0.335, 0.5, 0.58, 0.665, 0.82, 0.9, 1.0];

// Same beat as the travel curve — peaks where a surge lands, relaxes through
// each glide — driving the pulse/roll/churn cues so they land on the pull.
const PULSE_SCALE = [1, 1.015, 1.025, 1, 1.015, 1.025, 1, 1.015, 1.025, 1];
const ROLL_DEG = [0, 0.35, 0.5, 0.05, -0.35, -0.5, -0.05, 0.35, 0.5, 0];
const CHURN_OPACITY = [0, 0.35, 0.5, 0.05, 0.35, 0.5, 0.05, 0.35, 0.5, 0];
const CHURN_SCALE = [0.9, 1.05, 1.15, 0.9, 1.05, 1.15, 0.9, 1.05, 1.15, 0.9];

// Sway rides the same beat, quarter-cycle behind the pulse.
const SWAY_PROGRESS = [0, 0.13, 0.17, 0.41, 0.46, 0.5, 0.74, 0.79, 0.83, 1.0];
const SWAY_PCT = [0, 0.28, 0.4, 0.04, -0.28, -0.4, -0.04, 0.28, 0.4, 0];

export function LaneBackdrop({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement>;
}) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // travel = wrapper height − 100svh: 190svh - 100svh at sm+, 155svh - 100svh
  // below sm (the shorter mobile wrapper keeps object-cover width-limited so
  // her hands and the lane ropes aren't cropped at narrow viewports)
  const [desktop, setDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const travelMagnitude = desktop ? 90 : 55;

  const travelFrac = useTransform(scrollYProgress, PROGRESS, TRAVEL_FRACTION);
  const travelY = useTransform(travelFrac, (f) => {
    const frac = reduceMotion ? 0.5 : f;
    return `${-(frac * travelMagnitude)}svh`;
  });

  const pulseRaw = useTransform(scrollYProgress, PROGRESS, PULSE_SCALE);
  const pulse = useTransform(pulseRaw, (v) => (reduceMotion ? 1 : v));

  const rollRaw = useTransform(scrollYProgress, PROGRESS, ROLL_DEG);
  const roll = useTransform(rollRaw, (v) => (reduceMotion ? 0 : v));

  const swayRaw = useTransform(scrollYProgress, SWAY_PROGRESS, SWAY_PCT);
  const sway = useTransform(swayRaw, (v) => (reduceMotion ? "0%" : `${v}%`));

  const churnORaw = useTransform(scrollYProgress, PROGRESS, CHURN_OPACITY);
  const churnO = useTransform(churnORaw, (v) => (reduceMotion ? 0 : v));

  const churnSRaw = useTransform(scrollYProgress, PROGRESS, CHURN_SCALE);
  const churnS = useTransform(churnSRaw, (v) => (reduceMotion ? 1 : v));

  return (
    <div className="sticky top-0 h-[100svh] overflow-hidden" aria-hidden="true">
      <motion.div
        style={{ y: travelY }}
        className="absolute inset-x-0 top-0 h-[155svh] sm:h-[190svh]"
      >
        <motion.div
          style={{ scale: pulse, rotate: roll, x: sway, transformOrigin: "50% 48%" }}
          className="absolute -left-[5%] -right-[5%] -top-[2%] -bottom-[2%]"
        >
          <img
            src="/media/facet-swim.jpg"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover -scale-y-100"
            loading="lazy"
            decoding="async"
          />
          <motion.div
            aria-hidden="true"
            style={{
              x: "-50%",
              y: "-50%",
              opacity: churnO,
              scale: churnS,
              background: "radial-gradient(circle, rgb(var(--ink)) 0%, transparent 70%)",
            }}
            className="absolute left-1/2 top-[44%] h-[48svh] w-[48svh] sm:h-[60svh] sm:w-[60svh]"
          />
        </motion.div>
      </motion.div>

      {/* legibility stack — siblings of the travel layer, not children of it,
          so their gradient stops read against the 100svh frame, not the
          190svh travel wrapper */}
      <div className="absolute inset-0 bg-bg/72" />
      <div className="absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-bg to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}
