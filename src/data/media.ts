// Stylised illustration studies — intentionally anonymous: they show Senudi's
// interests, not her likeness. Stand-ins until real footage exists.
// To swap a composition, point `image` at one of the shipped alts
// (facet-swim-alt.jpg, facet-desk-alt.jpg). To add motion, drop files in
// public/media/ and set the `video` fields — see "Swapping in real footage"
// in REDESIGN-PROMPTS.md.

export type MediaAsset = {
  image: string;
  video: string | null;
  alt: string;
  // scrubbed video only: a still matching frame 0, so the loading handover
  // is invisible; `image` stays the standalone / reduced-motion still
  poster?: string;
};

export type FacetMedia = MediaAsset & {
  key: string;
  label: string;
  caption: string;
};

export const heroMedia: MediaAsset = {
  image: "/media/hero-bridge.jpg",
  video: null,
  alt: "Stylised illustration — a footbridge spanning from a forest ridge to a city skyline in morning fog",
};

// real footage, not a stylised study — a transparent cutout the hero scrubs
// with scroll; the poster holds the frame while the webm buffers, the image
// is what reduced-motion visitors get instead
export const heroPortraitMedia: MediaAsset = {
  image: "/media/portrait-cutout-still.webp",
  poster: "/media/portrait-cutout-poster.webp",
  video: "/media/portrait-cutout.webm",
  alt: "Senudi turning to face the camera",
};

export const facets: FacetMedia[] = [
  {
    key: "curious",
    label: "The Curious",
    caption: "Always asking why",
    image: "/media/facet-curious.jpg",
    video: null,
    alt: "Stylised illustration — brainstorming cross-legged on the floor among notebooks and a laptop, seen from above",
  },
  {
    key: "code",
    label: "The Builder",
    caption: "Ships what the business needs",
    image: "/media/facet-code.jpg",
    video: null,
    alt: "Stylised illustration — hands typing over glowing code",
  },
  {
    key: "swim",
    label: "The Swimmer",
    caption: "Breaststroke — early lengths",
    image: "/media/facet-swim-alt.jpg",
    video: null,
    alt: "Stylised illustration — a breaststroke swimmer surfacing head-on in a burst of white spray, lane rope blurred behind",
  },
  {
    key: "paint",
    label: "The Painter",
    caption: "Between two worlds, in colour",
    image: "/media/facet-paint.jpg",
    video: null,
    alt: "Stylised illustration — painting at an easel, seen from behind",
  },
];
