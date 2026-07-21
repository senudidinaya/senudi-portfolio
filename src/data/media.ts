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
    image: "/media/facet-swim.jpg",
    video: null,
    alt: "Stylised illustration — breaststroke down a pool lane, seen from above",
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
