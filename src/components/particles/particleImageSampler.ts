// Samples an image into a point field. Imported only by ParticleImage.tsx —
// kept three-free (plain typed arrays) since it doesn't need three at all, but
// it still lives inside the GL-only import graph.
import type { GradeName } from "./particleTypes";

export type SampledField = {
  /** xyz per point, in plane-space world units — becomes the `position` (aTarget) attribute */
  target: Float32Array;
  color: Float32Array;
  seed: Float32Array;
  boost: Float32Array;
  /** per-point coverage from the source alpha — 1 for any opaque image */
  alpha: Float32Array;
  count: number;
};

// the bridge deck sits as a thin horizontal line ~45% down the frame —
// measured off public/media/hero-bridge.jpg (forest ridge left, city right)
const BRIDGE_ROW_V = 0.452;
const BRIDGE_BAND_SIGMA = 0.032;

// --bridge/--warm/--cool light-theme values (0..1), used as a static grade
// baked into the sampled colour regardless of the runtime theme toggle
const WARM = [141 / 255, 84 / 255, 36 / 255];
const COOL = [58 / 255, 84 / 255, 112 / 255];
const TINT_STRENGTH = 0.18;

// +/-0.35 of a grid cell of positional jitter, baked into the position buffer
// at sample time. The sample grid is perfectly regular, which reads as a
// screen-door lattice now that the field is visible at rest over the plate
// rather than only mid-dissolve; this breaks it without moving any point far
// enough to leave the pixel it took its colour from.
const LATTICE_JITTER = 0.35;

// Downsampling a transparent cutout averages opaque silhouette pixels with
// fully-transparent ones, so the silhouette is ringed by cells with partial
// alpha. Dropping only a===0 would keep every one of them and — since the
// shader derives opacity from progress, not from the source — render them at
// FULL strength, fringing the cutout with stray points. Below the cutoff the
// un-premultiplied colour is mostly 8-bit quantisation error anyway, so those
// cells carry no usable colour and are dropped outright; what survives fades
// linearly from 0 at the cutoff to 1 at opaque, so hair edges terminate in a
// soft falloff instead of a hard step. An opaque source (the bridge JPEG is
// alpha-free, every byte 255) clears the cutoff everywhere and maps to exactly
// 1.0, leaving it bit-for-bit unaffected.
const ALPHA_CUTOFF = 110;
const ALPHA_RANGE = 255 - ALPHA_CUTOFF;

export async function samplePointField(opts: {
  src: string;
  pointBudget: number;
  containerAspect: number;
  visH: number;
  grade?: GradeName | null;
  /**
   * shrinks the sampled plane within the canvas. 1 fills the canvas (the
   * hero). Below 1 leaves empty canvas around the image — room for the field
   * to disperse into without meeting the clip rectangle — so a canvas
   * deliberately rendered larger than its visible frame can still land the
   * image at exactly the frame's size.
   */
  planeScale?: number;
  /**
   * Vertical anchor of the cover crop, mirroring CSS object-position.
   * "center" (default, and the hero band's behaviour) centres the overflow;
   * "top" pins the image's top edge to the canvas top, so a frame shorter than
   * the image crops from the bottom and never takes the head off. The <img>
   * and the point field must agree on this or the plate and the field drift
   * apart vertically.
   */
  anchorY?: "center" | "top";
}): Promise<SampledField & { planeWidth: number; planeHeight: number }> {
  const img = new Image();
  img.src = opts.src;
  await img.decode();

  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const imageAspect = iw / ih;

  const visH = opts.visH;
  const visW = visH * opts.containerAspect;
  let planeWidth: number;
  let planeHeight: number;
  if (imageAspect > opts.containerAspect) {
    planeHeight = visH;
    planeWidth = visH * imageAspect;
  } else {
    planeWidth = visW;
    planeHeight = visW / imageAspect;
  }

  // applied after the cover fit so it scales the fitted plane, leaving the
  // aspect untouched. Exactly 1 by default, which is an identity multiply.
  const planeScale = opts.planeScale ?? 1;
  planeWidth *= planeScale;
  planeHeight *= planeScale;

  const cols = Math.max(2, Math.round(Math.sqrt(opts.pointBudget * imageAspect)));
  const rows = Math.max(2, Math.round(Math.sqrt(opts.pointBudget / imageAspect)));

  // one grid cell in plane units — the jitter budget is a fraction of this
  const cellW = planeWidth / cols;
  const cellH = planeHeight / rows;

  const sampler = document.createElement("canvas");
  sampler.width = cols;
  sampler.height = rows;
  const ctx = sampler.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2d context unavailable");
  ctx.drawImage(img, 0, 0, cols, rows);
  const { data } = ctx.getImageData(0, 0, cols, rows);

  const graded = opts.grade === "bridge";

  // shifts the plane down so its top edge meets the canvas top instead of its
  // centre meeting the centre; exactly 0 for the default centre anchor
  const yAnchor = opts.anchorY === "top" ? -(planeHeight - visH) / 2 : 0;

  const max = cols * rows;
  const target = new Float32Array(max * 3);
  const color = new Float32Array(max * 3);
  const seed = new Float32Array(max * 3);
  const boost = new Float32Array(max);
  const alpha = new Float32Array(max);
  let n = 0;

  for (let r = 0; r < rows; r++) {
    const v = (r + 0.5) / rows;
    const dv = v - BRIDGE_ROW_V;
    const b = graded
      ? Math.exp(-(dv * dv) / (2 * BRIDGE_BAND_SIGMA * BRIDGE_BAND_SIGMA))
      : 0;
    for (let c = 0; c < cols; c++) {
      const idx = (r * cols + c) * 4;
      const a = data[idx + 3];
      if (a < ALPHA_CUTOFF) continue;

      const u = (c + 0.5) / cols;
      let rr = data[idx] / 255;
      let gg = data[idx + 1] / 255;
      let bb = data[idx + 2] / 255;

      if (graded) {
        const warmT = Math.max(0, 1 - u / 0.5) * TINT_STRENGTH;
        const coolT = Math.max(0, (u - 0.5) / 0.5) * TINT_STRENGTH;
        const base = 1 - warmT - coolT;
        rr = rr * base + WARM[0] * warmT + COOL[0] * coolT;
        gg = gg * base + WARM[1] * warmT + COOL[1] * coolT;
        bb = bb * base + WARM[2] * warmT + COOL[2] * coolT;
      }

      const p3 = n * 3;
      const jx = (Math.random() - 0.5) * 2 * LATTICE_JITTER * cellW;
      const jy = (Math.random() - 0.5) * 2 * LATTICE_JITTER * cellH;
      target[p3] = (u - 0.5) * planeWidth + jx;
      target[p3 + 1] = (0.5 - v) * planeHeight + jy + yAnchor;
      target[p3 + 2] = 0;

      color[p3] = rr;
      color[p3 + 1] = gg;
      color[p3 + 2] = bb;

      seed[p3] = Math.random();
      seed[p3 + 1] = Math.random();
      seed[p3 + 2] = Math.random();

      boost[n] = b;
      alpha[n] = (a - ALPHA_CUTOFF) / ALPHA_RANGE;

      n++;
    }
  }

  return {
    target: target.subarray(0, n * 3),
    color: color.subarray(0, n * 3),
    seed: seed.subarray(0, n * 3),
    boost: boost.subarray(0, n),
    alpha: alpha.subarray(0, n),
    count: n,
    planeWidth,
    planeHeight,
  };
}
