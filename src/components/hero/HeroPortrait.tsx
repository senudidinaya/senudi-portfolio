"use client";

import { useEffect, useRef, useState } from "react";
import { heroPortraitMedia } from "@/data/media";

// The hero figure — a transparent cutout whose motion is owned by scroll, not
// a clock. The video never plays: it sits paused and scroll progress over the
// hero's opening block maps straight onto currentTime, one seek per frame (the same
// coalesced-rAF shape as DitherMedia's scrub — events only schedule, the rAF
// callback does the layout read and the write). The server HTML carries the
// poster <img>; the video only mounts after a client-side reduced-motion
// check, so those visitors get the still and never fetch the webm — and the
// swap can't hydration-mismatch.

// scale by height so the figure grounds itself on the hero's bottom edge;
// max-w-full + object-contain keep narrow viewports from overflowing, and
// the letterbox that buys is invisible on a transparent source
const figure =
  "pointer-events-none h-[min(88vh,850px)] w-auto max-w-full select-none object-contain object-right-bottom";

// the figure exits with the first viewport of scroll — finish the turn at
// this fraction of that scroll, not in the last hidden sliver, so the final
// frame lands while the figure is still on screen
const COMPLETE_AT = 0.75;

export function HeroPortrait({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrub, setScrub] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setScrub(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!scrub) return;
    const vid = videoRef.current;
    if (!vid) return;
    // measured against the 88svh opening block, not the whole section — the
    // figure is out of view after ~one viewport, so a full-section span would
    // never finish the turn on screen
    const block = vid.closest<HTMLElement>("[data-hero-viewport]");
    if (!block) return;

    let raf = 0;
    let applied = -1;
    let inView = true;
    let seekable = false;

    // seeking is the expensive part, so beyond the one-per-frame coalescing,
    // moves smaller than one source frame are dropped entirely
    function frame() {
      raf = 0;
      if (!seekable || !inView) return;
      const rect = block!.getBoundingClientRect();
      // the block itself is stretched past the screen by the headline column,
      // so scrub over one viewport of scroll, not the block's own height
      const span = Math.min(rect.height, window.innerHeight);
      const p = -rect.top / Math.max(1, span * COMPLETE_AT);
      const t = (p < 0 ? 0 : p > 1 ? 1 : p) * vid!.duration;
      if (applied >= 0 && Math.abs(t - applied) < 1 / 24) return;
      applied = t;
      vid!.currentTime = t;
    }

    function schedule() {
      if (!raf) raf = requestAnimationFrame(frame);
    }

    // only take over from the poster once the whole webm is buffered —
    // seeking into an unbuffered range would stall mid-scrub
    function arm() {
      seekable = true;
      vid!.pause(); // paused for good; scroll owns the clock from here
      setReady(true);
      schedule();
    }

    if (vid.readyState >= 4) arm();
    else vid.addEventListener("canplaythrough", arm, { once: true });

    // no work while the hero is off-screen; re-sync on the way back in
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) schedule();
    });
    io.observe(vid);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      io.disconnect();
      vid.removeEventListener("canplaythrough", arm);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrub]);

  if (!scrub) {
    // server HTML and reduced-motion visitors: the still, nothing else
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={heroPortraitMedia.image}
        alt={heroPortraitMedia.alt}
        decoding="async"
        className={`${figure} ${className ?? ""}`}
      />
    );
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* the poster matches the webm's frame 0, so the handover is invisible */}
      {!ready ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroPortraitMedia.poster ?? heroPortraitMedia.image}
          alt=""
          aria-hidden="true"
          className={figure}
        />
      ) : null}
      <video
        ref={videoRef}
        src={heroPortraitMedia.video ?? undefined}
        muted
        playsInline
        preload="auto"
        aria-label={heroPortraitMedia.alt}
        className={ready ? figure : `${figure} absolute bottom-0 right-0 opacity-0`}
      />
    </div>
  );
}
