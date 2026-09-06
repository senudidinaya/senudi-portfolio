"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { useIntro } from "@/components/motion/Preloader";
import { portraitMedia } from "@/data/media";
import type { PointBudget } from "@/components/particles/particleTypes";
import { useParticleTier } from "@/components/particles/useParticleTier";

// same async-chunk rule as the band: three never enters the first-load JS.
// Both hero fields resolve to the SAME async chunk, so the portrait adds no
// second download — only a second WebGL context.
const ParticleImage = dynamic(
  () => import("@/components/particles/ParticleImage").then((m) => m.ParticleImage),
  { ssr: false, loading: () => null }
);

// roughly a third of the band's, before the cutout's transparent ~46% drops
// out of the grid on top of that. The frame is 300px wide against the band's
// full-bleed plate, so matching its budget would spend most of it on points
// smaller than a screen pixel.
const PORTRAIT_POINT_BUDGET: PointBudget = {
  low: 12000,
  mid: 34000,
  high: 60000,
};

// hover takes the field all the way apart; scroll only ever loosens it, so
// the portrait stays legible as a face while you read past it
const SCROLL_DISSOLVE_MAX = 0.55;

// The band's plate is tuned to throw a full-bleed image clear of the viewport;
// at this size that reads as an explosion. Low enough that the field loosens
// and breathes WITHIN the mount rather than travelling — which is what lets
// the plate confine it without the clip ever reading as a cut.
//
// No plane scale, edge fade or bleed wrapper: the canvas fills the frame
// exactly (plane scale 1) and the frame's own overflow-hidden contains the
// field. Those ParticleImage props keep their hero-identical defaults.
const PORTRAIT_DISPERSAL_AMP = 0.28;

// In the hero the frame is on screen from the start, so this resolves
// immediately — it stays because the gate is what keeps the second context
// from being created for a reader who never reveals the hero at all.
const MOUNT_MARGIN = "600px 0px";

export function HeroPortrait() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  // distance from the positioning container's top down to the TOP of the
  // second headline line. Measured rather than declared: the headline block is
  // flex-1/justify-center, so the h1's offset moves with viewport height, and
  // the bottom anchor lives in a different subtree from the top one.
  const [topPx, setTopPx] = useState<number | null>(null);
  const { resolvedTheme } = useTheme();
  const tier = useParticleTier();
  // the band gates its own field on the intro curtain lifting; the portrait
  // has to match or it would spin a WebGL context up behind the opaque
  // overlay and compete with the intro for the main thread
  const { introDone } = useIntro();

  const [near, setNear] = useState(false);
  const [glFailed, setGlFailed] = useState(false);
  const [plateReady, setPlateReady] = useState(false);
  const [handoff, setHandoff] = useState(false);

  // Mount gate, deliberately separate from the frameloop gate inside
  // ParticleImage: frameloop:"never" stops rAF and GPU work but does NOT
  // release a WebGL context, so with two fields on one page the thing worth
  // deferring is the second context existing at all. One-shot — tearing the
  // context down and rebuilding it on every pass would cost more than holding
  // it.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: MOUNT_MARGIN }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const useGL = introDone && near && tier !== null && !glFailed;

  // a downgrade (context lost, or useGL simply flipping false) must always
  // restore full <img> opacity — never leave a half-dissolved portrait behind
  useEffect(() => {
    if (!useGL) setPlateReady(false);
  }, [useGL]);

  // at rest both sides of the plateReady flip are opacity 1, so the 380ms
  // ease only shows if the reader was already scrolling when the assemble
  // finished. Arm it for that one step, then drop the CSS transition so the
  // dissolve-driven opacity lands on the frame it is set, not 380ms behind.
  useEffect(() => {
    if (!useGL || !plateReady) {
      setHandoff(false);
      return;
    }
    setHandoff(true);
    const t = window.setTimeout(() => setHandoff(false), 380);
    return () => window.clearTimeout(t);
  }, [useGL, plateReady]);

  // hover term: 0 at rest, 1 while the pointer is over the frame. Sprung so
  // the field breathes apart and knits back rather than snapping.
  const hoverTarget = useMotionValue(0);
  const hoverSpring = useSpring(hoverTarget, { stiffness: 90, damping: 22 });

  // scroll term: 0 while the portrait is centred, rising as it leaves — the
  // same exit shape the hero band uses, just capped lower downstream
  const { scrollYProgress: exit } = useScroll({
    target: cardRef,
    offset: ["center center", "end start"],
  });

  // max, not sum: hovering mid-scroll-out must not push past a full dissolve
  const dissolve = useTransform<number, number>(
    [hoverSpring, exit],
    ([hover, scroll]) => Math.max(hover, scroll * SCROLL_DISSOLVE_MAX)
  );

  // the plate is the exact inverse of the field: opaque at rest, gone by the
  // time the points carry the whole image
  const plateOpacity = useTransform(dissolve, (v) => 1 - v);

  // pointer devices only — a touch "hover" would latch the dissolve on after
  // a tap and never release it, so coarse pointers get the scroll term alone
  useEffect(() => {
    if (!useGL) return;
    const el = cardRef.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const enter = () => hoverTarget.set(1);
    const leave = () => hoverTarget.set(0);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      // releasing the hover on unmount/downgrade keeps the plate from being
      // stranded transparent behind a field that is no longer rendering
      hoverTarget.set(0);
    };
  }, [useGL, hoverTarget]);

  // The two anchors sit in different subtrees — the top belongs to the h1,
  // the bottom to the hero content container — so CSS alone cannot span them.
  // The h1 is read through the section rather than a passed ref so HeroOpening
  // stays untouched; one line height comes off its own computed style, which
  // tracks the display clamp for free.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const h1 = document.querySelector<HTMLElement>("#top h1");
    if (!h1) return;
    const measure = () => {
      // null while the xl gate has this display:none — nothing to place
      const parent = wrap.offsetParent as HTMLElement | null;
      if (!parent) return;
      const line = parseFloat(window.getComputedStyle(h1).lineHeight);
      if (!Number.isFinite(line)) return;
      setTopPx(
        h1.getBoundingClientRect().top - parent.getBoundingClientRect().top + line
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(h1);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  const theme: "light" | "dark" = resolvedTheme === "dark" ? "dark" : "light";

  return (
    // Two vertical anchors, so the height is derived rather than declared:
    //   top    the h1's top plus one display line — the top of the second
    //          headline line. Measured; see the effect above.
    //   bottom 96px above the hero content container's bottom, which IS the
    //          band's top edge: the band pulls up over the content by exactly
    //          that much (its sm:-mt-24).
    // No card, border, ground or padding — a transparent cutout straight onto
    // the cream page. The frame keeps overflow-hidden solely to contain the
    // dissolve.
    <div
      ref={wrapRef}
      className="group absolute bottom-24 right-5 hidden w-[300px] xl:block sm:right-8"
      style={{
        top: topPx ?? 0,
        // before the first measurement there is no honest position to paint
        // at, and a wrong one would visibly jump
        visibility: topPx === null ? "hidden" : undefined,
      }}
    >
      <div ref={cardRef} className="relative h-full w-full overflow-hidden">
        {/* the <img> carries the accessible name in every branch — the
            particle layer is aria-hidden and has no equivalent element, and
            opacity 0 still leaves this in the a11y tree, so it is never
            duplicated and never lost.
            object-top rather than the default centre: the frame is shorter
            than the image's 4:5, so the cover crop has to come off the bottom
            or it takes the top of her head with it. ParticleImage gets the
            same anchor so the field crops identically and stays in register. */}
        <motion.img
          src={portraitMedia.image}
          alt={portraitMedia.alt}
          width={900}
          height={1125}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top"
          style={
            useGL
              ? {
                  opacity: plateReady ? plateOpacity : 1,
                  transition: handoff
                    ? "opacity 380ms cubic-bezier(0.22, 1, 0.36, 1)"
                    : "none",
                }
              : undefined
          }
        />
        {useGL && tier && (
          <ParticleImage
            src={portraitMedia.image}
            dissolve={dissolve}
            tier={tier}
            theme={theme}
            pointBudget={PORTRAIT_POINT_BUDGET}
            dispersalAmp={PORTRAIT_DISPERSAL_AMP}
            anchorY="top"
            // normal in both themes: additive would accumulate a face into a
            // white blowout against the page behind it
            blend="normal"
            onReady={() => setPlateReady(true)}
            onContextLost={() => setGlFailed(true)}
          />
        )}
      </div>

      {/* Decorative sticker, peeled over the bottom-left corner. Sibling of
          the frame, so the frame's overflow-hidden can't clip it.
          pointer-events-none so its overhang — which sits outside the frame —
          can't trigger the group hover that the frame itself doesn't see,
          keeping the straighten and the dissolve on exactly the same signal. */}
      <img
        src="/media/sticker-at-work.svg"
        alt=""
        aria-hidden="true"
        width={96}
        height={96}
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 -rotate-[8deg] drop-shadow-[0_4px_6px_rgba(141,84,36,0.28)] transition-transform duration-300 ease-out group-hover:-rotate-2"
      />
    </div>
  );
}
