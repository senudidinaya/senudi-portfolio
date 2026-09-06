// Three-free shared surface between the first-load call sites (HeroBridgeBand,
// HeroPortrait) and the dynamically-imported ParticleImage scene. Only types
// and plain string literals cross this boundary (compile-erased, or a single
// inlined word) so the isolation invariant holds: nothing here may import
// three or @react-three/fiber.
import type { MotionValue } from "framer-motion";

export type Tier = "fallback" | "low" | "mid" | "high";

/** every tier that actually renders a point field — i.e. not the <img> fallback */
export type RenderTier = Exclude<Tier, "fallback">;

export type HeroTheme = "light" | "dark";

/** points to sample per tier; the kept count lands lower once transparent cells drop out */
export type PointBudget = Record<RenderTier, number>;

/**
 * Named colour grade applied at sample time. "bridge" is the hero's warm/cool
 * u-axis tint plus the span-row boost, measured off hero-bridge.jpg; the
 * constants live in particleImageSampler so they stay inside the GL-only
 * import graph rather than being passed in from a first-load module.
 */
export type GradeName = "bridge";

export type ParticleImageProps = {
  /** image sampled into the point field; alpha below the sampler cutoff is dropped */
  src: string;
  /**
   * dissolve progress: 0 = field at rest over an opaque plate, rising to 1 as
   * the plate hands over and the points disperse. Read fresh every active
   * frame, so it auto-seeds on mount and auto-resumes after an off-screen
   * pause with no separate wiring.
   */
  dissolve: MotionValue<number>;
  tier: RenderTier;
  theme: HeroTheme;
  pointBudget: PointBudget;
  /** scales every dispersal term; 1 = the hero's full flight, lower stays gentler */
  dispersalAmp?: number;
  /**
   * shrinks the sampled image within the canvas (1 = fills it). Pair a value
   * below 1 with a canvas rendered larger than the visible frame: the image
   * still lands at the frame's size, and the surplus canvas is room the field
   * can disperse into instead of being clipped on the frame's edge.
   */
  planeScale?: number;
  /**
   * vertical anchor of the cover crop, mirroring CSS object-position. Must
   * match the plate <img>'s object-position or the two drift apart.
   */
  anchorY?: "center" | "top";
  /** scales cursor repulsion radius and strength together; track planeScale to keep the feel */
  repelScale?: number;
  /**
   * fraction of the canvas half-extent over which points fade out as they
   * approach its bounds, so an escaping point dissolves rather than being cut
   * off on the clip rectangle. 0 disables it — right for a field that fills
   * its canvas edge to edge.
   */
  edgeFade?: number;
  /**
   * where cursor tracking listens. "canvas" is direct and correct when the
   * canvas receives pointer events; "window" is for a canvas made
   * pointer-events:none (so a smaller element underneath stays the hover
   * target) and derives the same NDC from the canvas's live rect.
   */
  pointerSource?: "canvas" | "window";
  /**
   * "auto" reproduces the hero: additive over the dark theme for accumulated
   * glow, normal over light (additive on ivory would clamp to white).
   * "normal" keeps normal blending in both themes — right for a portrait,
   * where additive would blow out skin tones against a dark plate.
   */
  blend?: "auto" | "normal";
  grade?: GradeName | null;
  /** fires once the assemble animation completes and the geometry is uploaded */
  onReady?: () => void;
  /** fires on webglcontextlost so the parent can restore the static <img> */
  onContextLost?: () => void;
};
