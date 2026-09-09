// Stylised illustration studies — intentionally anonymous: they show Senudi's
// interests, not her likeness. Stand-ins until real footage exists. The one
// exception is `portraitMedia`, which is a real photograph of her.
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

// The About section backdrop (the lane/water plate behind "Who I am").
// `video` drives it; set `video: null` to fall straight back to the still.
export const aboutBackdrop: MediaAsset = {
  image: "/media/facet-swim.jpg",
  video: "/media/about-water.mp4",
  alt: "Stylised illustration — a swimmer mid-length seen through teal water",
};

// The hero portrait, in the right gutter beside the opening headline. A
// cutout with a real alpha channel — head and shoulders on transparency, no
// background — which is what lets the particle field dissolve the silhouette
// itself rather than a rectangle. Its lower edge fades out in the alpha so the
// figure dissolves into the bridge band it overlaps. Intrinsic 900x1125 (4:5);
// the HeroPortrait frame matches that ratio exactly so the sampled plane fits
// with no crop. No `video` — the motion here is the point field.
//
// The background must be alpha 0, not merely near-zero: a veil of low-alpha
// pixels carrying a light background colour reads as a faint lighter rectangle
// against the dark plate, which is what the first cut of this asset did.
export const portraitMedia: MediaAsset = {
  image: "/media/senudi-portrait.png",
  video: null,
  alt: "Senudi Rupasinghe — head-and-shoulders portrait, long dark hair, looking to camera",
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
    image: "/media/facet-swim-alt.png",
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

// The work section backdrop (the desk plate behind "How I've grown"). A real
// photograph, not a study: the editor open on a JWT service, lit only by its
// own screen. It sits under an always-dark plate, so the asset's near-black
// field is the point — the scrim only has to hold the glow back off the type.
// No `video`; the section is long and text-dense, and a moving plate under a
// reading column fights the copy.
export const workBackdrop: MediaAsset = {
  image: "/media/work-desk.jpg",
  video: null,
  alt: "A hand reaching toward a laptop screen in a dark room, the editor open on Java source lit only by its own glow",
};
