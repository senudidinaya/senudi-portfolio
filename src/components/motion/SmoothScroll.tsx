"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// The live instance, if smooth scrolling is running (null on the admin, under
// reduced motion, or before hydration). Lets the menu overlay pause and drive
// scrolling while it is open.
let activeLenis: Lenis | null = null;

export function getLenis() {
  return activeLenis;
}

// Lenis-driven smooth scrolling for the public site. When the visitor prefers
// reduced motion we never instantiate Lenis, so scrolling (and the CSS
// scroll-padding-top anchor offset) stays fully native. The admin keeps
// native scrolling as well.
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    activeLenis = lenis;

    let frame = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      activeLenis = null;
      lenis.destroy();
    };
  }, [pathname]);

  return <>{children}</>;
}
