"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Native scroll (and prefers-reduced-motion) is a complete fallback: this
// component only ever layers Lenis's inertia on top, never replaces the
// browser's own scroll position, so #anchor links + scroll-padding-top
// keep working untouched either way.
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1 });

    let frameId = requestAnimationFrame(raf);
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
