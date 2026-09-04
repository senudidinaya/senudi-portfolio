"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { MotionReveal } from "@/components/motion/MotionReveal";

// Dotted spine: a 2px-on/6px-off repeating gradient. Every span that draws
// part of the spine (dim track, reduced-motion fallback, dynamic lit
// overlay) shares this exact box + gradient so their dots phase-lock — no
// seam where one hands off to another.
const dotted = (variable: string) =>
  `repeating-linear-gradient(to bottom, rgb(var(${variable})) 0 2px, transparent 2px 8px)`;
const spineBoxStyle = {
  backgroundOrigin: "border-box" as const,
  backgroundPosition: "0 0",
};

type Bounds = { top: number; height: number };

type TimelineCtxValue = {
  activeIndex: number | null;
  register: (index: number, el: HTMLLIElement | null) => void;
};
const TimelineContext = createContext<TimelineCtxValue>({
  activeIndex: null,
  register: () => {},
});

// Boundaries between items sit at the MIDPOINT of the gap between them, so
// the marker's position maps to exactly one item everywhere in [0, olHeight]
// — no dead zone in the gaps, no double-light at the seams.
function findActive(markerY: number, itemEls: Map<number, HTMLLIElement>, olTop: number) {
  const items = Array.from(itemEls.entries())
    .map(([index, el]) => {
      const r = el.getBoundingClientRect();
      return [index, { top: r.top - olTop, height: r.height }] as [number, Bounds];
    })
    .sort((a, b) => a[1].top - b[1].top);
  if (items.length === 0) return null;
  for (let i = 0; i < items.length; i++) {
    const [index, b] = items[i];
    const next = items[i + 1];
    const upper = next ? (b.top + b.height + next[1].top) / 2 : Infinity;
    if (markerY < upper) return index;
  }
  return items[items.length - 1][0];
}

// Everything scroll-linked lives in this child so it can be mounted
// conditionally — under reduced motion, Timeline never renders it at all, so
// no scroll or resize listener is ever attached. The marker, the lit-spine
// clip, and the active card all read from ONE MotionValue (`p`, a spring of
// scrollYProgress, kept — not deleted — because active-detection now reads
// the SAME spring instead of the raw value, so all three stay in lockstep
// even mid-flick, which raw scrollYProgress alone wouldn't buy you here).
function SpineMotion({
  olRef,
  itemEls,
  onActive,
}: {
  olRef: React.RefObject<HTMLOListElement>;
  itemEls: React.RefObject<Map<number, HTMLLIElement>>;
  onActive: (index: number | null) => void;
}) {
  const { scrollYProgress } = useScroll({
    target: olRef,
    offset: ["start 0.75", "end 0.5"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.5 });

  const bottomInset = useTransform(p, (v) => `${(1 - v) * 100}%`);
  const clipPath = useMotionTemplate`inset(0 0 ${bottomInset} 0)`;
  const top = useTransform(p, [0, 1], ["0%", "100%"]);

  useMotionValueEvent(p, "change", (latest) => {
    const ol = olRef.current;
    if (!ol) return;
    const olTop = ol.getBoundingClientRect().top;
    onActive(findActive(latest * ol.offsetHeight, itemEls.current ?? new Map(), olTop));
  });

  // ResizeObserver's first callback fires shortly after observe() starts,
  // even with nothing yet "changed" — which lands after every TimelineItem
  // sibling has registered, so seeding the initial active card here (rather
  // than in a mount effect racing those registrations) is always correct.
  useEffect(() => {
    const ol = olRef.current;
    if (!ol || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const olTop = ol.getBoundingClientRect().top;
      onActive(findActive(p.get() * ol.offsetHeight, itemEls.current ?? new Map(), olTop));
    });
    ro.observe(ol);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <motion.span
        aria-hidden="true"
        style={{ clipPath, backgroundImage: dotted("--ink"), ...spineBoxStyle }}
        className="absolute left-0 top-0 h-full w-px"
      />
      <motion.span
        aria-hidden="true"
        style={{ top, x: "-50%", y: "-50%" }}
        className="absolute left-0 h-2 w-2 bg-ink ring-4 ring-bg"
      />
    </>
  );
}

// Timeline spine: a dotted track with a marker that travels down it as the
// section scrolls through the viewport, plus the shared active-card state
// every TimelineItem reads via context.
export function Timeline({ children }: { children: React.ReactNode }) {
  const olRef = useRef<HTMLOListElement>(null);
  const itemEls = useRef<Map<number, HTMLLIElement>>(new Map());
  const reduce = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const register = useCallback((index: number, el: HTMLLIElement | null) => {
    if (el) itemEls.current.set(index, el);
    else itemEls.current.delete(index);
  }, []);

  return (
    <TimelineContext.Provider value={{ activeIndex, register }}>
      <ol ref={olRef} className="relative mt-12 space-y-6 pl-8 sm:pl-10">
        {/* dim dotted track — always visible */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 h-full w-px"
          style={{ backgroundImage: dotted("--line"), ...spineBoxStyle }}
        />
        {/* fully-lit static fallback: pure CSS (motion-reduce only), so a
            reduced-motion visitor never sees a frame of the empty clip
            before a post-mount swap — there IS no swap, this is the only
            lit spine they ever see */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 hidden h-full w-px motion-reduce:block"
          style={{ backgroundImage: dotted("--ink"), ...spineBoxStyle }}
        />
        {!reduce && (
          <SpineMotion olRef={olRef} itemEls={itemEls} onActive={setActiveIndex} />
        )}
        {children}
      </ol>
    </TimelineContext.Provider>
  );
}

export function TimelineItem({
  index,
  dotClass,
  origin = false,
  children,
}: {
  index: number;
  dotClass: string;
  origin?: boolean;
  children: (active: boolean) => React.ReactNode;
}) {
  const { activeIndex, register } = useContext(TimelineContext);
  const active = activeIndex === index;
  const liRef = useRef<HTMLLIElement>(null);
  const borderClass = dotClass.replace("bg-", "border-");

  useEffect(() => {
    register(index, liRef.current);
    return () => register(index, null);
  }, [index, register]);

  return (
    <li ref={liRef} className="relative">
      <motion.span
        aria-hidden="true"
        className={`absolute top-7 -left-[38px] h-3 w-3 border-2 ring-4 ring-bg transition-colors duration-300 sm:-left-[46px] ${
          !origin && active ? `${dotClass} border-transparent` : `bg-bg ${borderClass}`
        }`}
        initial={{ scale: 0.3, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* elbow tick: a short hairline from the node toward the card */}
      <span
        aria-hidden="true"
        className="absolute top-7 -left-[26px] h-px w-3 bg-line sm:-left-[34px]"
      />
      <MotionReveal>{children(active)}</MotionReveal>
    </li>
  );
}
