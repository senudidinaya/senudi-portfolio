// Three-free shared surface between HeroBridgeBand (first-load) and the
// dynamically-imported HeroParticles scene. Only types cross this boundary
// (compile-erased) so the isolation invariant holds: nothing here may import
// three or @react-three/fiber.
import type { MotionValue } from "framer-motion";

export type Tier = "fallback" | "low" | "mid" | "high";

export type HeroTheme = "light" | "dark";

export type HeroParticlesProps = {
  /** exit-scroll progress: 0 while the band is centred, rising to 1 as it leaves */
  exit: MotionValue<number>;
  tier: Exclude<Tier, "fallback">;
  theme: HeroTheme;
  /** fires once the assemble animation completes and the geometry is uploaded */
  onReady?: () => void;
  /** fires on webglcontextlost so the parent can restore the static <img> */
  onContextLost?: () => void;
};
