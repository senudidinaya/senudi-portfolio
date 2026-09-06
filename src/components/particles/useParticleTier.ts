"use client";

// Device capability probing shared by every particle call site, so the hero
// and the About portrait can never disagree about what a device can run.
// Three-free by construction — it only reads navigator/matchMedia — so it is
// safe to import from first-load modules.
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { RenderTier, Tier } from "./particleTypes";

function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function detectLowPower(): boolean {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  const saveData = nav.connection?.saveData === true;
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarseSmall =
    window.matchMedia("(pointer: coarse)").matches &&
    window.matchMedia("(max-width: 820px)").matches;
  return saveData || cores <= 4 || coarseSmall;
}

function detectTier(): RenderTier {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  const saveData = nav.connection?.saveData === true;
  const cores = navigator.hardwareConcurrency ?? 4;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const largeViewport = window.matchMedia("(min-width: 1024px)").matches;
  if (cores >= 8 && finePointer && largeViewport && !saveData) return "high";
  if (cores >= 5 && finePointer) return "mid";
  return "low";
}

/**
 * The tier this device should render at, or null when it should get the plain
 * <img> instead — reduced motion, low power, or no WebGL. Seeded to null: the
 * navigator/WebGL probes throw during SSR prerender, so they can only ever run
 * post-mount, which also means the first client render always matches the
 * server's fallback markup.
 */
export function useParticleTier(): RenderTier | null {
  const reduce = useReducedMotion();
  const [tier, setTier] = useState<Tier>("fallback");

  useEffect(() => {
    if (reduce) {
      setTier("fallback");
      return;
    }
    // low-power devices never render a field regardless of WebGL support —
    // skip probing entirely there, since creating (even a throwaway) WebGL
    // context has real, measurable main-thread cost under CPU throttling
    if (detectLowPower() || !detectWebGL()) {
      setTier("fallback");
      return;
    }
    setTier(detectTier());
  }, [reduce]);

  return tier === "fallback" ? null : tier;
}
