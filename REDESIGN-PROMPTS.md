# Senudi Portfolio — Dithered Editorial Redesign Prompt Pack (v2, sondaven-inspired)

Goal: rebuild the public site as a **two-tone dithered editorial experience** in the spirit of
sondaven.com — everything reduced to paper-tan + deep umber, imagery rendered through an
animated vertical-line dither ("transitioning shadows"), terminal-print hybrid UI (serif display
type + mono labels + `+++ CHAPTER +++` markers) — while keeping the admin/content system, both
themes (dark = the inverted print), and reduced-motion support fully intact.

The source stills already exist in `public/media/` (Higgsfield "Soul Cinema", generated in the
planning session that wrote this pack). They are **hand-painted animation-film-style
illustrations** — deliberately stylised so the figures are anonymous (faces hidden by framing:
from behind, from directly above, or hands only), expressing Senudi's interests without depicting
a real person: `hero-bridge.jpg` (21:9 bridge between a forest ridge and a city skyline),
`facet-swim.jpg` (top-down breaststroke in a pool lane), `facet-paint.jpg` (painting at an easel,
seen from behind), `facet-code.jpg` (hands typing over glowing code), `facet-curious.jpg`
(top-down floor brainstorm with laptop and notebooks). Two spare compositions ship alongside for
easy swaps: `facet-swim-alt.jpg` (head-on breaststroke splash) and `facet-desk-alt.jpg` (at her
desk gesturing at a code screen) — swapping = pointing a manifest path at the alt file. All are
high-contrast on purpose: contrast is what survives dithering. Everything is **video-ready** so
real footage of Senudi can replace stills later with zero code changes (see "Swapping in real
footage").

## Design north star (applies to every phase)

- **v3 COURSE CORRECTION (2026-07-22) — supersedes the two-tone rule below.** The shipped
  all-duotone build was judged ugly: imagery read as colorless noise and the khaki palette felt
  wrong. Standing rules now: (1) a **green-anchored editorial palette** — warm ivory paper, deep
  green-black ink, pine green (`--bridge`) as the primary accent (green is Senudi's lucky color),
  `warm`/`cool` as secondary tints; dark theme is deep green-charcoal with a luminous green.
  (2) **Dither is a transition, not a destination** — imagery materializes through the
  vertical-line dither and then *resolves into the full-colour illustration*; the steady state of
  every image is clear and colorful. Small dither accents (wordmark erosion, noise ticks,
  preloader) remain. PHASE 9 applies this correction to the shipped build.
- ~~Two tones carry the site~~ (superseded): the historical duotone rule that phases 0–8 were
  written against; kept for context since those phase texts reference it.
- **Micro-accents only** (amended): `bridge` green is now allowed as a confident accent — tinted
  display words, the selection color, link hovers, the monogram — while `warm` / `cool` stay as
  tints on small labels and single words. Still no huge flat color fields.
- **Type system:** Newsreader serif for display (UPPERCASE, font-light, tight tracking) and for
  italic captions; IBM Plex Mono for labels, markers, counters, meta; IBM Plex Sans for body.
- **Signature motion:** images never fade in — they **materialize column by column** through the
  dither. Reveals are masked rises; easing `cubic-bezier(0.22, 1, 0.36, 1)`; curtain/wipes
  `cubic-bezier(0.76, 0, 0.24, 1)`.
- **Never touched:** `src/app/admin/**`, both `.admin-theme` blocks in globals.css, `src/lib/**`,
  `src/data/content.ts`, the zod schema. Components stay presentational (content via props).
  TypeScript strict stays clean. `prefers-reduced-motion` always gets a static, fully visible site.

## How to use

1. Open **this folder** (`senudi-portfolio`) in VS Code and start Claude Code here.
2. Run the phases **in order, one at a time**, each in a **fresh conversation** (`/clear`).
3. Keep `npm run dev` running; eyeball the site after every phase. Each phase ends with a git
   commit so you can roll back one phase with `git reset --hard HEAD~1`.
4. Note: an earlier editorial attempt (paper palette + motion components) was rolled back in
   commit `063c7de` — `framer-motion` and `lenis` are still installed, but the motion components
   must be (re)created in Phase 0. Don't try to resurrect the deleted files from git; the specs
   below supersede them.

---

## PHASE 0 — Foundation: duotone palette, smooth scroll, motion primitives, terminal utilities

```text
CONTEXT: This repo is my Next.js 14 (App Router) + React 18 + TypeScript (strict) + Tailwind 3.4 portfolio. The whole public site renders from one SiteContent object (seed in src/data/content.ts, optionally overridden by Postgres via src/lib/content.ts) — components are presentational and receive content as props. Theming is CSS variables in src/app/globals.css (:root = light, .dark = dark), mapped to Tailwind color names in tailwind.config.ts, with next-themes (darkMode: "class"). The private admin panel (src/app/admin/**) uses the .admin-theme blocks in globals.css — the admin must not change. framer-motion and lenis are already in package.json (do not reinstall). I am redesigning toward a sondaven.com-style two-tone dithered editorial look: tan paper + deep umber ink, dark mode = the inversion, serif display + mono labels.

GOAL: Lay the foundations only — duotone palette, grain, smooth scroll, motion primitives, terminal-style utilities. No component restyling yet (the palette swap will restyle everything globally by itself — expected).

DO:
1. In src/app/globals.css replace ONLY the :root and .dark palette values (keep variable names identical; keep both .admin-theme blocks byte-for-byte unchanged):
   :root — --bg: 178 164 128; --surface: 186 173 140; --surface-2: 166 151 112; --ink: 41 37 23; --muted: 89 81 56; --line: 122 110 78; --warm: 138 84 26; --cool: 72 87 92; --bridge: 58 93 63;
   .dark — --bg: 33 30 19; --surface: 43 39 25; --surface-2: 55 50 32; --ink: 193 180 143; --muted: 146 135 102; --line: 82 74 49; --warm: 209 157 89; --cool: 143 161 157; --bridge: 133 171 131;
   (These are starting values — if muted-on-bg falls below WCAG AA 4.5:1 in either theme, darken/lighten --muted until it passes; final audit happens in Phase 7.)
2. Micro-accent discipline: grep the public components for existing large warm/cool/bridge fills (bg-warm/10 etc.) and neutralize any that read as colored surfaces — accents may only tint text, dots, and hairlines from now on.
3. Add a fixed full-viewport film-grain overlay (inline SVG feTurbulence data-URI background, ~3% opacity, pointer-events-none, aria-hidden, high z-index) rendered once from src/app/layout.tsx covering the public site in both themes.
4. Create src/components/motion/SmoothScroll.tsx — a "use client" Lenis provider (rAF loop, lerp ≈ 0.1) that is a complete no-op under prefers-reduced-motion. Mount it in layout.tsx around children. Anchor links (#about, #work, #contact) must keep working with the existing scroll-padding-top.
5. Create motion primitives in src/components/motion/ (all "use client", all using framer-motion's useReducedMotion — under reduced motion they render fully visible static content):
   - RevealText.tsx — splits a string into words, masked rise-up stagger on first inView. Props: as, className, delay, stagger.
   - MotionReveal.tsx — block-level fade + rise on inView (will gradually replace src/components/Reveal.tsx).
   - CountUp.tsx — animates numbers on inView; must parse content values like "3+", "92%", "2024" (animate numeric part, keep prefix/suffix); unparseable values render as plain text.
   - Magnetic.tsx — child translates a few px toward cursor on hover (pointer:fine only), springs back.
6. Terminal-print utilities in globals.css:
   - .terminal-card — hairline border (1px, line color) on transparent bg; used with a header row pattern: serif title left, mono meta right (e.g. "[ 01 ]"), a double hairline (border-b + a second 1px rule 3px apart) separating header from body. Provide the double-rule as a ::after or utility so components can reuse it.
   - .marker — mono uppercase eyebrow in the "+++ 01 / ABOUT +++" pattern: letter-spacing 0.3em, text-xs, muted; the +++ clusters are literal text content (components will pass them), the class just styles.
   Keep the existing .eyebrow class working (other components still use it until later phases).
7. Extend tailwind.config.ts with fluid display sizes: "display-xl" clamp(3rem, 8vw, 7.5rem) line-height 0.95, "display-lg" clamp(2.25rem, 5.5vw, 4.5rem) line-height 1.02, plus a tight display letterSpacing token. Keep all existing tokens.

CONSTRAINTS: Do not touch src/app/admin/**, src/lib/**, src/data/content.ts, the zod schema, or the .admin-theme CSS. No component restyling beyond the accent-fill neutralization. TypeScript strict clean. New motion code is client components; server components stay server.

VERIFY: `npm run build` passes. In dev: the site renders tan-paper/umber in light and inverted in dark; scrolling is buttery; anchors land correctly; no hydration warnings; /admin still renders in its own unchanged slate/blue palette. With DevTools emulating prefers-reduced-motion, scrolling is native. Commit "phase 0: duotone foundation".
```

---

## PHASE 1 — The dither engine (the signature) + media manifest

```text
CONTEXT: Next.js 14 App Router portfolio mid-redesign toward a sondaven.com-style two-tone dithered look. Duotone CSS-variable palette now live in src/app/globals.css (:root tan paper + umber ink, .dark inverted; rgb triplets in --bg/--ink/etc.), framer-motion + lenis installed, motion primitives in src/components/motion/. Five high-contrast cinematic stills exist in public/media/: hero-bridge.jpg (21:9) and 2:3 portraits facet-curious.jpg, facet-code.jpg, facet-swim.jpg, facet-paint.jpg. Admin (src/app/admin/**), src/lib/**, src/data/content.ts and the zod schema are off-limits. Both themes + prefers-reduced-motion must keep working.

GOAL: Build the site's signature: a canvas component that renders any image (later: video) as an animated two-tone vertical-line dither that "materializes" column by column — plus a typed media manifest. This is the single most important phase; take the time to get it beautiful.

DO:
1. Create src/data/media.ts — a plain typed manifest (NOT part of SiteContent; no schema/admin changes):
   export type MediaAsset = { image: string; video: string | null; alt: string };
   export type FacetMedia = MediaAsset & { key: string; label: string; caption: string };
   - heroMedia: { image: "/media/hero-bridge.jpg", video: null, alt: "Stylised illustration — a footbridge spanning from a forest ridge to a city skyline in morning fog" }
   - facets (in this order): curious → { label: "The Curious", caption: "Always asking why", alt: "Stylised illustration — brainstorming cross-legged on the floor among notebooks and a laptop, seen from above" }, code → { label: "The Builder", caption: "Ships what the business needs", alt: "Stylised illustration — hands typing over glowing code" }, swim → { label: "The Swimmer", caption: "Breaststroke — early lengths", alt: "Stylised illustration — breaststroke down a pool lane, seen from above" }, paint → { label: "The Painter", caption: "Between two worlds, in colour", alt: "Stylised illustration — painting at an easel, seen from behind" }; image "/media/facet-<key>.jpg", video: null.
   - Top comment: these are stylised illustration studies (intentionally anonymous — they show Senudi's interests, not her likeness) until real footage exists; to swap a composition, point image at one of the shipped alts (facet-swim-alt.jpg, facet-desk-alt.jpg); to add motion, drop files in public/media/ and set the video fields (see "Swapping in real footage" in REDESIGN-PROMPTS.md).
2. Create src/components/dither/DitherMedia.tsx ("use client"):
   Props: { src: string; video?: string | null; alt: string; className?: string; cell?: number (CSS px per dither cell, default 3); transition?: "materialize" | "none" (default "materialize"); breathe?: boolean (default false) }.
   Implementation requirements:
   - Load src into an offscreen Image(); draw cover-fitted into an offscreen canvas downsampled to cols × rows where cols = ceil(elementWidth / cell); read per-cell luminance once per (re)size.
   - Visible <canvas> fills the element (ResizeObserver + devicePixelRatio-aware). For each cell, draw a vertical line segment (fillRect of width ≈ 55% of cell, full cell height) in the CURRENT ink color when luminance < threshold(x, y). Threshold comes from a 4×4 Bayer matrix indexed primarily by column (weight (x % 4) over (y % 4)) so shading turns into vertical line density — dark areas = dense columns, highlights = sparse broken columns. That is the sondaven look.
   - Two-tone + theme-reactive: canvas paints ONLY ink-colored marks on a transparent canvas; the wrapper div carries the bg (bg-bg). Resolve ink via getComputedStyle on mount and re-render when the html class changes (MutationObserver on documentElement, "class") so theme toggling re-inks instantly.
   - Materialize transition (the "transitioning shadows"): on first inView (IntersectionObserver), over ~0.9s each column starts from a randomized threshold offset (noise) that decays to 0 with a per-column stagger — columns flicker and settle into the image. Expose a small imperative hook or prop so later phases can also trigger a brief ~150ms re-scramble on hover. After settling, stop the rAF loop entirely (zero idle CPU).
   - breathe: when true (and motion allowed, and the element is on-screen per the IntersectionObserver), after settling run a very slow idle drift — a low-amplitude sine offset (~±2% of the threshold range, ~6–8s period, per-column phase offset) at ≤ 12fps — so the scene subtly shimmers alive instead of freezing. Must fully pause off-screen and under reduced motion; CPU cost must stay negligible (verify in Phase 7).
   - transition="none" or prefers-reduced-motion: paint the final dithered frame once, no animation loop, no scramble, no breathe.
   - Video-ready: when video is set and motion is allowed, render a hidden <video muted loop playsInline autoPlay preload="metadata" poster={src}> and drive the same dither pass from the current frame at ≤ 24fps; IntersectionObserver pauses it off-screen. Under reduced motion, ignore video and dither the still.
   - a11y: the visible canvas gets role="img" and aria-label={alt}. Perf: cap total cells at ~24,000 (raise cell size on huge elements); all loops must be allocation-free per frame.
3. Create a dev-only playground at src/app/dither-lab/page.tsx (metadata robots noindex): renders all five manifest assets through DitherMedia at various sizes + a cell-size control, so we can tune. It will be deleted in the QA phase.
4. Add public/media/*.jpg to git in this commit if not already tracked.

CONSTRAINTS: No content/schema/admin/lib changes. TypeScript strict. Transform/opacity/canvas-paint only — no layout thrash. Works in both themes (verify the ink swap live).

VERIFY: `npm run build` passes. On /dither-lab: all five images materialize column-by-column, look unmistakably like the sondaven reference (vertical line texture, two tones only), re-ink instantly on theme toggle, sit static under emulated reduced motion, and CPU settles to ~0% after the animation finishes. 375px wide: no overflow, cells scale sensibly. Commit "phase 1: dither engine + media manifest".
```

---

## PHASE 2 — Preloader ritual + entrance curtain

```text
CONTEXT: Next.js 14 App Router portfolio mid-redesign (sondaven-style two-tone dither). Duotone palette in globals.css (:root/.dark), motion primitives in src/components/motion/, the DitherMedia engine in src/components/dither/. Site is content-driven via props; admin (src/app/admin/**), lib, schema off-limits; both themes + reduced motion must work.

GOAL: A short branded preloader with dither DNA: shown once per tab session, then a curtain reveal into the hero.

DO:
1. Create src/components/motion/Preloader.tsx ("use client") + an IntroProvider context exposing introDone: boolean, so other components can hold their entrances until the curtain lifts.
2. Behavior:
   - First load in a tab session: fixed inset-0 overlay in bg color above everything. Centered: mono uppercase marker "+++ SENUDI RUPASINGHE +++", beneath it one serif italic line: "Between what business needs and what engineering ships." Bottom-left: a strip of animated dither noise (a thin canvas or CSS pattern of vertical ink lines whose density flickers — reuse DitherMedia's column logic on pure noise if convenient). Bottom-right: mono counter 000 → 100 with a 1px progress hairline. Total ≈ 1.4s.
   - Then the panel lifts like a curtain (translateY) with cubic-bezier(0.76, 0, 0.24, 1) over ~0.7s and unmounts. introDone flips true exactly when the curtain starts lifting.
   - sessionStorage key "senudi_intro_seen": later loads in the same tab render nothing, introDone = true immediately, zero flash.
   - prefers-reduced-motion: never show it; introDone = true immediately.
   - Lock body scroll while visible; release after. No CLS: the page is fully rendered underneath (SSR/SEO unaffected).
3. Mount IntroProvider + Preloader in src/app/layout.tsx (client boundary only around what needs it; layout stays a server component).

CONSTRAINTS: No content/admin/lib changes. TypeScript strict. Both themes (overlay uses bg/ink variables).

VERIFY: `npm run build` passes. Fresh tab → plays once; reload → skipped, no flash; new tab → plays; reduced motion → never plays. Commit "phase 2: preloader".
```

---

## PHASE 3 — Hero: the Prologue (dithered scene + oversized type)

```text
CONTEXT: Next.js 14 App Router portfolio mid-redesign (sondaven-style two-tone dither; duotone palette live). Hero is src/components/Hero.tsx (server component receiving profile + metrics props from SiteContent — every displayed string comes from props). Available: DitherMedia in src/components/dither/ (canvas two-tone dither with "materialize" transition, video-ready), media manifest src/data/media.ts (heroMedia), motion primitives (RevealText, MotionReveal, CountUp, Magnetic), IntroProvider exposing introDone, fluid sizes text-display-xl/lg, .marker + .terminal-card utilities. Fonts: Newsreader serif / IBM Plex Sans / IBM Plex Mono. Admin/lib/schema off-limits; both themes; reduced motion static.

GOAL: Rebuild the hero as a full-viewport chapter opening: the dithered bridge landscape materializing behind oversized serif type.

DO:
1. Hero min-h-[100svh], vertically composed: status row top, headline center-weighted, metrics at the bottom edge.
2. Backdrop: DitherMedia with heroMedia (absolute inset-0, behind content, breathe enabled), materialize triggered when introDone (immediately if preloader skipped). Legibility scrims built from rgb(var(--bg)): vertical gradient at top (~30%), stronger gradient at the bottom (~35%) so the hero dissolves into the page, and a full-bleed bg wash at ~25–40% tuned per theme so the headline passes WCAG AA over the busiest area. The dither itself is two-tone so it needs less scrim than a photo would — tune visually, keep the scene clearly visible.
3. Above the headline: marker "+++ PROLOGUE +++".
4. Headline: keep the existing sentence from props, set in font-serif font-light UPPERCASE at text-display-xl, tight tracking, stacked 3–4 lines. Contrast trick: the word "bridge" lowercase italic tinted text-bridge; "what the business needs" tinted warm; "what engineering ships." tinted cool (micro-accents on words only). Reveal line-by-line with masked rise stagger gated on introDone.
5. Status row: mono uppercase text-xs — pulsing bridge-green dot + profile.openTo left, profile.location right, 1px hairline underneath. Tagline (profile.tagline): max-w-xl, muted, delayed reveal.
6. CTAs: "See the work" → #work and "Download resume" → profile.resumeFile as editorial mono uppercase links with animated underline sweep + arrow nudge, wrapped in Magnetic. Scroll cue bottom: mono "SCROLL" + a 1px vertical line that draws/loops (static under reduced motion).
7. Metrics: keep the dl grid + content; borderless editorial — hairline separators, serif display values through CountUp, mono uppercase labels; cells stagger on inView.
8. TranslationPanel: keep ask → build content exactly; restyle as a .terminal-card — serif header "TRANSLATION" with mono "[ LIVE ]" meta right, double hairline, THE ASK / THE BUILD mono tags tinted warm/cool, connector arrow line draws itself on inView.
9. Split client pieces into small "use client" children; Hero keeps receiving content via props only.

CONSTRAINTS: All content strings from props (openTo, location, tagline, theBridge.*, resumeFile, metrics). No admin/lib/schema changes. Both themes; TypeScript strict; reduced motion = static dithered frame + visible text.

VERIFY: `npm run build` passes. The scene materializes after the curtain; headline clearly readable over it in BOTH themes at 375px and 1440px; reduced motion shows everything static; no horizontal overflow; LCP not degraded by more than ~0.3s (the dither canvas paints from an already-loaded image — keep the source <img> priority-loaded). Commit "phase 3: hero prologue".
```

---

## PHASE 4 — Chapter system + About + "In her element" facets band

```text
CONTEXT: Next.js 14 App Router portfolio mid-redesign (sondaven-style dither; duotone palette; phases 0–3 done). Sections use src/components/SectionHeading.tsx (eyebrow + title). About is src/components/About.tsx (about paragraphs, education, additional — all via props). DitherMedia engine + media manifest (facets: curious/code/swim/paint with labels, captions, honest alt) exist. Motion primitives + .marker/.terminal-card utilities available. Admin/lib/schema off-limits; both themes; reduced motion static.

GOAL: Turn the page into a numbered chapter narrative, restyle About editorially, and close it with a cinematic band of the four dithered persona portraits.

DO:
1. SectionHeading.tsx → chapter heading:
   - Eyebrow becomes a marker: "+++ 01 / ABOUT +++" pattern (normalize the eyebrow strings sections pass so numbering runs 01 About → 02 Skills → 03 Work → 04 Contact in page order).
   - Title: UPPERCASE font-serif font-light text-display-lg, masked line reveal on inView.
   - Ghost index: huge decorative chapter numeral behind/beside the title (outlined via -webkit-text-stroke in line color, 8–12% opacity, aria-hidden) with subtle scroll parallax (useScroll + useTransform; static under reduced motion).
   - 1px hairline rule above each chapter heading spanning content width.
2. Rhythm: standardize public sections to py-28 sm:py-40.
3. About.tsx (content from props): first paragraph as serif pull-quote text-2xl sm:text-3xl font-light max-w-3xl; remaining paragraphs two columns on lg+; education + additional as editorial list rows (hairline top border, mono uppercase meta left column, serif content right; hover eases left padding + darkens the border; stagger reveal).
4. Create src/components/Facets.tsx (server component + small "use client" card child) rendered at the end of the About section:
   - Marker "+++ IN HER ELEMENT +++" + hairline rule, then the strip.
   - lg+: grid-cols-4 gap-4; below lg: horizontal scroll-snap strip (overflow-x-auto, snap-x snap-mandatory, cards w-[68vw] sm:w-[300px] flex-none), native touch scroll, visible keyboard focus.
   - Card: fixed 2:3 frame, hairline border, overflow-hidden; DitherMedia (cell ≈ 2–3, breathe enabled) fills it; mono uppercase label bottom-left on a small bg scrim strip; serif italic caption under the frame in muted.
   - Hover/focus-within: trigger DitherMedia's brief column re-scramble (~150ms) + label underline sweep; nothing on touch/reduced motion.
   - Cards materialize on inView with 60–90ms stagger; video-ready via the manifest (poster = the still; plays on hover only on pointer:fine + hover:hover, never under reduced motion).
5. Accessibility: manifest alt on every canvas; strip keyboard-reachable; labels/captions real text.

CONSTRAINTS: No SiteContent/schema/admin changes — the band is driven by src/data/media.ts only. Both themes; TypeScript strict; transform/opacity/canvas-paint only.

VERIFY: `npm run build` passes. Chapters read 01–04 in order; ghost numerals cause no overflow at 375px; facets: 4-across at 1440px, snap strip at 375px, hover re-scramble feels alive, reduced motion fully static; both themes. Commit "phase 4: chapters + about + facets".
```

---

## PHASE 5 — Work timeline as a scroll story + Skills

```text
CONTEXT: Next.js 14 App Router portfolio mid-redesign (sondaven dither; phases 0–4 done). src/components/Projects.tsx renders a "Foundations" card (projects whose kind includes ".NET foundation") + flagship ProjectCards on a vertical timeline (ol with border-l + dots) + a publication block. src/components/Skills.tsx renders three skill groups (business / shared / technical). That grouping logic and admin-controlled ordering must not change. Motion primitives, .marker/.terminal-card, duotone theming, reduced-motion rules as established. Admin/lib/schema off-limits.

GOAL: Make Work read as a scroll-driven story and give Skills an editorial treatment with one signature moving element.

DO:
1. Projects.tsx timeline: replace the static border-l spine with a 1px track + an overlaid progress line whose scaleY binds to section scroll progress (useScroll targeting the section + useTransform, origin top); fully drawn under reduced motion. Dots scale/fade in per item.
2. ProjectCard (fields from props: timeframe, title, kind, summary, highlights, stack, metric, link): timeframe mono uppercase; title font-serif UPPERCASE text-3xl sm:text-4xl font-light; hairline-border card, transparent bg filling to bg-surface on hover; link arrow slides right on hover; stack chips become one mono uppercase line separated by " +++ " (the pack's interpunct, on-brand); metric.value through CountUp.
3. FoundationsCard: keep heading/description; inner mini-cards become a horizontal strip (overflow-x-auto, scroll-snap, cards ~w-[260px] flex-none) enhanced with framer-motion drag="x" on pointer devices, mono hint "HOLD & DRAG →" above (hidden under reduced motion; native scroll + keyboard focus must still work).
4. Publication block: .terminal-card — serif title, mono DOI link with animated underline sweep.
5. Skills.tsx: between heading and groups, a full-bleed marquee strip: every skill name from all three groups, mono uppercase, separated by " +++ ", slow constant CSS loop (duplicated list aria-hidden for the seam; pauses on hover; completely static under reduced motion). The three groups become editorial columns with mono numbered headers tinted per side (01 BUSINESS warm, 02 BRIDGE bridge, 03 TECHNICAL cool — use actual group titles from content) and serif items with underline sweep on hover.

CONSTRAINTS: Grouping/order logic untouched; content only from props; both themes; TypeScript strict; transform/opacity-only animations.

VERIFY: `npm run build` passes. Spine draws with scroll; foundations strip drags AND scrolls natively; marquee seamless, pauses on hover, static under reduced motion; both themes; 375px clean. Commit "phase 5: work + skills".
```

---

## PHASE 6 — Nav, Contact finale, Footer

```text
CONTEXT: Next.js 14 App Router portfolio mid-redesign (sondaven dither; phases 0–5 done). src/components/Nav.tsx is a fixed top bar (links, resume link, ThemeToggle, mobile menu). src/components/Contact.tsx has contact links + an EmailJS form with a mailto: fallback when EmailJS isn't configured — that logic is critical and must not change (visual changes only). src/components/Footer.tsx is the footer. Motion primitives, .marker/.terminal-card, duotone theming, reduced-motion rules as established. Admin/lib/schema off-limits.

GOAL: Finish the narrative: the sondaven-style menu system (slim bar + full-screen overlay), a big closing Contact chapter, a signature footer.

DO:
1. Nav.tsx top bar (all viewports): left — a mono uppercase "MENU" button whose small "+" glyph rotates to "✕" when open; on lg+ the four section links ALSO render inline beside it (mono uppercase text-xs tracking-[0.2em], active-section underline via IntersectionObserver). Center — the name from profile props as a small serif uppercase wordmark with a new .dither-text treatment (add the utility in globals.css: background-clip:text over a repeating vertical 1px ink/transparent stripe gradient so the serif letters read as a scanline-eroded print — the SON DAVEN wordmark look; fully static). Right — ThemeToggle + the resume link restyled as a pill (mono uppercase text-xs, 1px border, rounded-full, ink background with bg-tone text). Keep from the old spec: the 1px scroll-progress hairline pinned to the very top edge (scaleX = page progress), translucent bg/80 + backdrop-blur after the hero, hide on scroll down / reveal on scroll up (always visible under reduced motion).
2. Menu overlay — the sondaven signature, one overlay for EVERY viewport (the separate mobile menu goes away): fixed inset-0 panel painted in ink with all type in bg tone (light theme = umber panel with tan type, exactly the reference; dark theme = the tan inverse). Top row mirrors the bar positions so the swap feels seamless: "✕ CLOSE" mono left where MENU was, the .dither-text wordmark center one size up, ThemeToggle + the resume pill right (pill inverts: bg-tone background, ink text). Center: the four section links stacked and centered, font-serif UPPERCASE at clamp(2.5rem, 7vw, 4.5rem) leading-[1.12], staggered masked rise on open (~50ms per link); hover/focus turns a link hollow (transparent fill + 1px -webkit-text-stroke in the bg tone), and the section currently in view carries small mono "+++" markers flanking its link. Bottom center: two mono columns from contact props — E-MAIL always, second column phone if the content has one else LINKEDIN — tiny muted uppercase labels over the values. Bottom-left corner: a small dither-noise strip (reuse the preloader's noise element, ~90×14px; flickers ~0.3s on open then freezes; static under reduced motion). Motion: the panel wipes down from the top edge with cubic-bezier(0.76, 0, 0.24, 1) over ~0.6s, links stagger in after the wipe; close reverses faster (~0.35s); both instant under reduced motion. Behavior: body scroll + Lenis locked while open; ESC closes; focus trapped inside and returned to the MENU button on close; role="dialog" aria-modal="true"; choosing a link closes the overlay then smooth-scrolls to the section (existing scroll-padding respected).
3. Contact.tsx: closing chapter — above existing content, giant serif UPPERCASE display statement at text-display-xl revealed line-by-line ("LET'S BUILD THE BRIDGE." hardcoded ONLY if no equivalent content field exists; prefer content fields). Email becomes an oversized serif link with full-width animated underline. Form restyled minimal: transparent inputs, border-b hairline only, mono uppercase labels, focus turns the border ink; submit wrapped in Magnetic, styled as a .terminal-card button. DO NOT touch EmailJS/mailto logic, validation, status messages, or content fields.
4. Footer.tsx: the name as a huge serif uppercase wordmark at text-display-lg at ~10% opacity spanning the width; beneath it a mono meta row: © current year, location, "BACK TO TOP ↑" (smooth-scrolls to #top, Magnetic). Optional: a final tiny marker "+++ END +++" centered at the very bottom.

CONSTRAINTS: Zero changes to form logic and content plumbing; both themes; reduced motion (nav always visible, reveals static); TypeScript strict.

VERIFY: `npm run build` passes. Send a test through the contact form (or confirm the mailto fallback opens) — behavior identical. Menu overlay: opens with the wipe and closes cleanly at 375px AND 1440px, ESC + focus trap + scroll lock all work, links land on their sections, the "+++" markers track the in-view section, and the umber/tan inversion looks right in both themes. Inline links' active underline tracks scroll on lg+; progress hairline completes at page bottom. Commit "phase 6: nav + contact + footer".
```

---

## PHASE 6.5 — Sondaven menu retrofit (run this if you already ran the OLD Phase 6)

The menu spec in PHASE 6 above was upgraded after the pack was first executed. If phases 0–8 are
already committed, do NOT re-run Phase 6 — run this retrofit instead. It touches only the nav.

```text
CONTEXT: Next.js 14 App Router portfolio with the sondaven dither redesign fully applied and committed (phases 0–8: duotone tan/umber CSS-variable palette in :root/.dark, DitherMedia canvas engine + src/data/media.ts manifest, preloader with dither noise + curtain, Lenis smooth scroll, motion primitives in src/components/motion/, chapters/facets/work/skills/contact/footer restyled, launch kit). src/components/Nav.tsx currently has the PREVIOUS treatment: serif wordmark, inline mono links with active underline, scroll-progress hairline, hide-on-scroll bar, and a full-screen mobile-only menu. REDESIGN-PROMPTS.md in the working tree contains an updated PHASE 6 whose DO items 1–2 spec the new sondaven menu system. Admin (src/app/admin/**), src/lib/**, src/data/content.ts and the zod schema are off-limits. Both themes and prefers-reduced-motion must keep working.

GOAL: Retrofit ONLY the nav: replace the current Nav.tsx treatment with the sondaven menu system exactly as specced in REDESIGN-PROMPTS.md → PHASE 6 → DO items 1 and 2. Contact and Footer are already done — do not restyle them again.

DO:
1. Open REDESIGN-PROMPTS.md, find PHASE 6 DO items 1–2, and implement them against the current code — reusing what already exists (scroll-progress hairline, hide-on-scroll logic, IntersectionObserver section tracking, ThemeToggle, resume link) rather than rebuilding from scratch. The old mobile-only menu is deleted; the new overlay serves every viewport.
2. Add the .dither-text utility to globals.css if it does not exist yet.
3. All text/links stay content-driven from props (nav items, profile name, resumeFile, contact email/phone/linkedin).

CONSTRAINTS: No content/schema/admin/lib changes; both themes; reduced motion = instant open/close, everything static, bar always visible; TypeScript strict; transform/opacity/canvas-paint animations only.

VERIFY: `npm run build` passes. At 375px AND 1440px: the overlay opens with the top-down wipe and closes cleanly; ESC closes it; focus is trapped inside and returns to the MENU button; body scroll (and Lenis) lock while open; choosing a link closes then lands on the right section; the "+++" markers flank the in-view section's link; the umber/tan inversion reads correctly in both themes; resume pill + theme toggle work in the bar AND inside the overlay. Reduced motion: instant, static, bar visible. Commit everything INCLUDING the modified REDESIGN-PROMPTS.md with message "phase 6.5: sondaven menu retrofit".
```

---

## PHASE 7 — Brutal polish pass: micro-interactions, accessibility, performance QA

```text
CONTEXT: Next.js 14 App Router portfolio that just went through a sondaven-style dither redesign (phases 0–6): duotone tan/umber palette (:root/.dark), DitherMedia canvas engine (hero scene + 4 facet portraits from public/media/, manifest src/data/media.ts), preloader, Lenis, framer-motion reveals/parallax/marquee/drag, terminal-editorial components. Content system (SiteContent props, src/lib/**, src/data/content.ts, zod schema) and admin panel (src/app/admin/**, .admin-theme CSS) were intentionally untouched. A dev playground exists at src/app/dither-lab/.

GOAL: Act as a brutal reviewer of this site, then fix what you find. Assume a first-time recruiter on a mid-range phone: everything confusing, janky, slow, low-contrast, or broken gets listed ranked by how badly it hurts that first impression — then fix the top issues and run the full QA matrix.

DO:
1. Brutal pass: click/scroll through every screen and state (fresh tab with preloader, revisit without, both themes, mobile menu, form submit + failure states, hover states, keyboard-only pass). List issues ranked, fix the top ones.
2. Custom cursor (subtle): small ink-colored follower ring easing behind the native cursor, scaling up over links/buttons — ONLY on (pointer: fine) and (hover: hover) and never under reduced motion; native cursor stays visible.
3. Consistency: one easing family — cubic-bezier(0.22, 1, 0.36, 1) reveals, cubic-bezier(0.76, 0, 0.24, 1) curtain; durations 0.6–0.9s; identical reveal distances. Nothing above the fold animates on load except the intended hero sequence.
4. Accessibility: :focus-visible ring clearly visible against tan AND umber; muted-on-bg ≥ 4.5:1 in BOTH themes (adjust --muted if short — likely on the tan theme); decoratives (ghost numerals, grain, marquee duplicate, cursor ring, dither canvases' wrappers) aria-hidden where appropriate while every DitherMedia keeps role="img" + alt; drag strip and marquee content keyboard-reachable; ::selection styled with bridge at ~20% alpha.
5. Performance: all animations transform/opacity/canvas-paint; DitherMedia loops fully stop when settled (verify ~0% idle CPU in the Performance panel); will-change sparing; no Lenis layout thrash; tree-shaken framer-motion imports; hero source image priority-loaded. `npm run build` — record first-load JS. Lighthouse mobile on `npm run build && npm start`: Performance ≥ 90, Accessibility ≥ 95 — fix shortfalls (the dither canvas must not tank LCP/TBT; if it does, delay materialize until after LCP).
6. Delete src/app/dither-lab/ (the playground).
7. QA matrix — actually check every cell: {light, dark} × {375px, 1440px} × {reduced-motion on, off}: no horizontal overflow, no invisible text, no stuck animations, dither legible everywhere.
8. Admin regression: /admin login works, editing + saving a field updates the public site, admin still uses its own .admin-theme palette.

VERIFY: Report: the ranked issue list with what was fixed, Lighthouse scores, QA matrix results, first-load JS, admin confirmation. Commit "phase 7: polish + qa".
```

---

## PHASE 8 — Launch kit: OG image, favicon, share metadata

```text
CONTEXT: Next.js 14 App Router portfolio (src/app/layout.tsx builds metadata via generateMetadata() from getContent(): title "name — headline", description tagline, plain openGraph with no image). The site is a two-tone dithered editorial design (tan #B2A480-ish paper / umber #292517-ish ink); hero still at public/media/hero-bridge.jpg (21:9). Deploys on Vercel. Admin/lib/schema off-limits; metadata stays content-derived.

GOAL: Premium link previews (LinkedIn/WhatsApp/X) and a real favicon that match the dithered identity.

DO:
1. Install sharp as a devDependency. Add scripts/make-og.mjs: read public/media/hero-bridge.jpg, center-crop/resize to exactly 1200×630, convert to the site duotone (greyscale → map shadows to rgb(41,37,23) and highlights to rgb(178,164,128) via sharp tint/linear ops so the card matches the site), quality ~80, write public/og.jpg. Run it once and keep the script.
2. Favicon: src/app/icon.svg — an "S." serif monogram, umber-on-tan hardcoded (system serif like Georgia inside the SVG to avoid font loading; must read at 16px). Also generate src/app/apple-icon.png (180×180, same mark) from the script via sharp.
3. layout.tsx metadata: metadataBase (new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://<prod-domain>" — read the real domain from vercel/README or leave a TODO)), openGraph.images [{ url: "/og.jpg", width: 1200, height: 630, alt: name + headline }], twitter: { card: "summary_large_image" }. Everything else stays content-driven.
4. Commit public/og.jpg, icons, and the script.

CONSTRAINTS: No admin/lib/schema changes; TypeScript strict.

VERIFY: `npm run build` passes; /og.jpg is exactly 1200×630 in the site duotone with the bridge clearly visible; favicon shows in the tab. After deploy, check the URL in opengraph.xyz or LinkedIn Post Inspector. Commit "phase 8: launch kit".
```

---

## PHASE 9 — Colour correction: green editorial + resolve-to-colour imagery

```text
CONTEXT: Next.js 14 App Router portfolio with the full dithered redesign shipped and committed (phases 0–8 plus the 6.5 menu retrofit). Current state, verified by code audit:
- Palette: CSS variables as BARE RGB TRIPLETS (e.g. "178 164 128") in src/app/globals.css — :root is tan/umber (bg 178 164 128, ink 41 37 23, muted 64 58 40, line 122 110 78, warm 84 50 13, cool 46 57 61, bridge 38 62 42), .dark is the umber inversion. Tailwind maps them via rgb(var(--x) / <alpha-value>) — the bare-triplet format MUST be preserved. Both .admin-theme blocks override the same variables for /admin and must stay byte-for-byte untouched (including body:has(.admin-theme) .grain).
- Dither engine: src/components/dither/DitherMedia.tsx — canvas-ONLY duotone renderer (no <img> ever in the DOM; the photo is an off-DOM luminance sampler). Props: src, video (string|null), alt, className, cell=3, transition="materialize"|"none", breathe=false, autoContrast=true, videoAutoPlay=true; forwardRef handle { scramble(duration?), playVideo(), pauseVideo() }. It paints vertical ink lines (fillStyle from getComputedStyle --ink, MutationObserver on <html> class repaints on theme flip) on a wrapper div with bg-bg; canvas is TRANSPARENT between lines. State lives in an `s` ref reset by the main useEffect on prop changes; the rAF loop self-terminates when idle; reduced motion sets s.static (paints the settled dither once, disables video).
- Exactly two call sites: (1) src/components/hero/HeroBackdrop.tsx — full-viewport backdrop behind the hero text (breathe, autoContrast={false}, no cell prop) under bg-bg/30 (dark 40%) wash + top/bottom from-bg gradients, mounted when introDone; this is the main "ugly" culprit: ink-colored noise directly behind ink-colored centered text. (2) src/components/FacetCard.tsx — four persona cards (cell 2.5, breathe, videoAutoPlay={false}, hover/focus calls scramble()+playVideo(), leave calls pauseVideo()), mapped by src/components/Facets.tsx from src/data/media.ts.
- Launch kit is BAKED duotone: scripts/make-og.mjs desaturates hero-bridge.jpg and maps grey to INK=[41,37,23]/PAPER=[178,164,128] for public/og.jpg, and renders src/app/apple-icon.png from an inline SVG hardcoding #b2a480/#292517; src/app/icon.svg uses the same two hex colors.
- Menu overlay (Nav.tsx) flips the palette via .tone-capture/.tone-invert (swaps --bg/--ink; --cool→tone-bg for focus rings) — it assumes bg/ink stay a high-contrast pair. Utilities .dither-text (wordmark), the Nav overlay noise canvas, and the Preloader noise strip all read --ink at draw time and follow a palette swap automatically.
Admin (src/app/admin/**), src/lib/**, src/data/content.ts and the zod schema are off-limits. framer-motion + lenis installed. Both themes and prefers-reduced-motion must keep working.

GOAL: Two corrections, keeping all structure and motion: (1) replace the khaki duotone with a green-anchored editorial palette (green is the owner's lucky color); (2) imagery must END UP clear and full-colour — the dither becomes an entrance/hover transition that RESOLVES into the real illustration, and the hero text never sits on noise again.

DO:
1. Palette swap in src/app/globals.css — replace ONLY the :root and .dark values (bare triplets, keep variable names, keep the contrast-intent comments updated to match):
   :root — --bg: 244 242 234 (warm ivory); --surface: 250 249 243; --surface-2: 233 231 220; --ink: 24 32 26 (green-black); --muted: 96 104 96; --line: 214 212 198; --warm: 141 84 36 (ochre); --cool: 58 84 112 (slate); --bridge: 22 101 68 (pine green — the primary accent).
   .dark — --bg: 17 22 19; --surface: 24 30 26; --surface-2: 33 41 36; --ink: 235 233 224; --muted: 158 166 156; --line: 52 60 54; --warm: 212 165 100; --cool: 138 164 192; --bridge: 104 200 150 (luminous green).
   These values are PRE-VERIFIED WCAG AA — copy them exactly, do not re-derive (measured ratios light/dark: ink-on-bg 14.87/15.04, muted-on-bg 5.14/7.31, muted-on-surface 5.46/6.77, warm-on-bg 5.47/8.16, cool-on-bg 6.99/7.10, bridge-on-bg 6.29/8.96); update the contrast-intent comments to these numbers. --line is decorative-hairline-only (1.33/1.61:1 — fine for dividers per WCAG 1.4.11), but the Contact form's border-b inputs are a meaningful boundary: give inputs a stronger rest border (border-muted/60, or dedicated 3:1 hues 141 140 131 light / 94 100 95 dark) while decorative rules keep --line. Do not touch the .admin-theme blocks.
2. Add a "resolve" mode to DitherMedia (default stays "duotone" so nothing breaks silently):
   - New prop: mode?: "duotone" | "resolve" (default "duotone").
   - In resolve mode render a real <img src={src} alt={alt}> absolutely positioned under the canvas (inset-0, h-full w-full, object-cover); move the accessible name to the <img> and set the canvas aria-hidden (in duotone mode the canvas keeps role="img" as today).
   - The canvas must paint an OPAQUE background in the current --bg tone behind its ink lines while dithering (today it is transparent between lines — the colour image must not leak through during the dither pass). Resolve --bg the same way --ink is resolved (getComputedStyle, re-resolved by the existing MutationObserver).
   - Choreography: materialize sweep exactly as today → settle → the canvas fades to opacity 0 over ~0.7s with cubic-bezier(0.22, 1, 0.36, 1), revealing the colour image beneath → rAF loop fully stops (keep the zero-idle-cost invariant). Attach the opacity transition ONLY when initiating a fade-out (inline style or class toggle), never statically — a static transition would turn scramble's snap-to-visible into a 0.7s ramp. Keep the canvas's last frame while fading: once a fade-out has begun, the theme-flip MutationObserver callback must only re-resolve --ink/--bg and SKIP repaintCurrent() (a later scramble repaints with fresh colours anyway); without this, a theme toggle repaints mid-fade and every later flip repaints an invisible canvas.
   - scramble(duration) in resolve mode: clear the transition and snap canvas opacity to 1 in the same frame, play the existing decaying scramble, then re-attach the transition and fade out again — the hover shimmer that ends in colour. Resolve-mode callers should pass a longer duration (see DO 4): the 150ms default is too brief to read before the 0.7s fade.
   - breathe: only active during the dithered pass; a no-op once resolved.
   - Reduced motion in resolve mode: render the colour <img> immediately and never paint the canvas (this branch differs from duotone mode's existing static-dither behaviour, which stays as-is).
   - Video-ready: in resolve mode with a video set, after the resolve moment unhide the actual <video> (object-cover, muted loop playsInline poster={src}) as the visible layer instead of canvas-sampling it; playVideo()/pauseVideo() keep working. All manifest videos are currently null, so implement the simple version and note it.
   - The mode state lives in the `s` ref like everything else (it resets on prop changes — fine).
3. Hero recomposition — text on clean paper, image in a framed band just below the fold:
   - DELETE src/components/hero/HeroBackdrop.tsx entirely: its import/usage in Hero.tsx, the aria-hidden wrapper, the bg-bg/30 wash and both from-bg gradient divs. The opening (status row, +++ PROLOGUE +++ marker, headline with its tinted words, tagline, CTAs, scroll cue) now sits on the clean ivory/charcoal background — the tinted headline words finally pop.
   - Restructure Hero.tsx (it is a SERVER component — no hooks in it): the min-h-[100svh] flex column currently wraps BOTH <HeroOpening/> and <HeroMetrics/>; change it to wrap <HeroOpening/> ALONE, so the opening keeps filling the first viewport and the scroll cue stays pinned to the fold. Below that wrapper, still inside the section's max-w-content px container, render a NEW client component src/components/hero/HeroBridgeBand.tsx ("use client"), then <HeroMetrics/>. The band therefore lands between the scroll cue and the metrics, just below the first fold.
   - HeroBridgeBand.tsx: mount the full-content-width .terminal-card frame UNCONDITIONALLY at aspect-[16/9] sm:aspect-[21/9] with a bg-surface inner fill — the fixed aspect ratio is what guarantees zero layout shift, and the fill keeps the frame from sitting empty during SSR and while the preloader plays (.terminal-card itself is transparent). Inside it, once useIntro().introDone (import useIntro from the Preloader module — the same gate the deleted HeroBackdrop used; NOT useIntroGate), render <DitherMedia mode="resolve" src={heroMedia.image} video={heroMedia.video} alt={heroMedia.alt} cell={3} />. DitherMedia's own IntersectionObserver (threshold 0.15) then makes it materialize when scrolled into view and resolve into the full-colour illustration.
   - Keep the <link rel="preload" as="image"> in Hero.tsx.
4. Facets go resolve: in src/components/FacetCard.tsx pass mode="resolve" (keep cell={2.5}, videoAutoPlay={false} and the hover wiring, but call scramble(400) instead of the bare scramble() — hover now shimmers visibly and settles back into colour). Drop the breathe prop here — FacetCard is the only site still passing it once HeroBackdrop is gone (the new band never has it). Labels, captions, alts unchanged.
5. Launch kit refresh:
   - scripts/make-og.mjs: remove the desaturate/normalise/linear duotone steps — full-colour center-crop of public/media/hero-bridge.jpg to exactly 1200×630, jpeg q80; ALSO delete the now-dead INK/PAPER constants and the a/b coefficient derivation at the top of the script; regenerate public/og.jpg.
   - Recolor the monogram: paper #F4F2EA, mark #166544 (pine) in BOTH src/app/icon.svg and the inline SVG inside make-og.mjs that renders src/app/apple-icon.png; re-render apple-icon.png.
6. Straggler sweep: grep src/ and scripts/ for the old baked tones — "#b2a480", "#292517", and the umber/tan triplets in ALL spacings (regex `41[, ]+37[, ]+23` and `178[, ]+164[, ]+128`, which also catches make-og.mjs's "41, 37, 23" comma-space style) — and fix anything found. The .dither-text wordmark, Nav overlay noise canvas, and Preloader noise strip stay (they read --ink at draw time and become green-black accents automatically). Grain overlay stays at 0.03.

CONSTRAINTS: No admin/lib/schema/content changes. Bare RGB triplet format everywhere (Tailwind <alpha-value> depends on it). The .tone-invert menu flip must stay legible — the new bg/ink pair is deliberately high-contrast, verify visually in both themes. TypeScript strict. Transform/opacity/canvas-paint animations only; the engine's zero-idle-cost invariant holds (rAF stops after resolve).

VERIFY: `npm run build` passes. Hero: headline sits on clean paper with nothing behind the text; the bridge band dithers in and RESOLVES to the full-colour illustration. Facet cards resolve to colourful illustrations; hover briefly re-scrambles then returns to colour. Dark theme reads as green-charcoal with luminous green accents; menu overlay legible in both themes; ::selection is now green-tinted. Reduced motion: colour images shown immediately, everything static. /og.jpg is full colour at 1200×630; favicon + apple icon show the pine monogram. Contrast: muted/warm/cool/bridge ≥ 4.5:1 on bg in both themes. QA matrix {light, dark} × {375px, 1440px} × {reduced-motion on, off}: no overflow, no invisible text, no stuck canvases. Commit "phase 9: green editorial + resolve-to-colour imagery".
```

---

## PHASE 10 — Pressroom: full-bleed plates, cross-wired facets, tactical density

Design synthesized from a 3-concept competition judged for hirer-wow, feasibility, and cringe-risk.
Hard rules that emerged: **no pinned/hijacked scrolling, no glyph-shuffle "hacker" text ever, the
cursor signature lives on exactly ONE surface, every effect ships its reduced-motion fallback in
the same commit.**

```text
CONTEXT: Next.js 14 App Router portfolio, phases 0–9 applied and committed. Current state: green editorial palette (ivory paper / green-black ink / pine #166544 accent; dark = green charcoal) as bare RGB triplets in globals.css; DitherMedia (src/components/dither/DitherMedia.tsx) has mode="duotone"|"resolve" — resolve renders a real <img> under the canvas, materializes column-by-column (setOffsets "in" sweep + flick() noise), then fades the canvas out (transition attached only during fade; MutationObserver skips repaintCurrent once fading; rAF loop fully stops when idle — the ZERO-IDLE invariant; ResizeObserver→layout()→getImageData is the expensive path; MAX_CELLS clamp grows cell size on large surfaces). Handle: scramble(duration), playVideo(), pauseVideo(). Call sites: src/components/hero/HeroBridgeBand.tsx (a .terminal-card aspect-[16/9] sm:aspect-[21/9] framed band inside the content column, gated on useIntro().introDone, between the scroll cue and HeroMetrics — Hero.tsx is a server component whose min-h-[100svh] wrapper holds HeroOpening alone) and src/components/FacetCard.tsx (2:3 cards, cell 2.5, scramble(400) + playVideo on hover/focus, rendered by src/components/Facets.tsx as a lg:grid-cols-4 at the end of About.tsx, with a mobile snap-x strip below lg). Sections use a py-28 sm:py-40 rhythm; SectionHeading has ghost parallax chapter numerals; Skills has a marquee band with border-y; Work has a scroll-progress timeline + drag strip; Lenis smooth scroll (anchors:true, scroll-padding-top 5rem, getLenis() exported); full-screen menu overlay in Nav.tsx via .tone-capture/.tone-invert. Admin (src/app/admin/**), src/lib/**, src/data/content.ts, zod schema off-limits. NOTE: class values cited below come from a code audit — if the implementing session finds slightly different classnames, apply the stated intent, don't hunt for exact strings.

GOAL: The imagery currently sits in polite boxes surrounded by dead air. Turn the page into a pressroom: imagery runs edge-to-edge, type physically collides with the pictures, the index controls the images, the dither engine becomes a scroll-driven instrument — and the whitespace gets executed. Premium, never gimmicky; a recruiter must still scan everything in 30–60s.

DO:
1. Engine upgrades (additive, both preserve the zero-idle invariant):
   a. Scrub mode: extend transition to "materialize" | "none" | "scrub". CRITICAL: the IntersectionObserver stays MOUNTED in scrub mode — it still maintains s.inView (which gates frame(), kick(), scramble() and video control), pauses offscreen and stop()s the loop; the ONLY thing disabled is kick()'s clock-driven sweep. A new handle method setProgress(p: 0..1) drives the same "in" sweep math: columns with c/cols < p settle, a frontier band of ~8 columns gets flick() noise, the rest stay unstarted. setProgress always stores s.lastP and marks s.started; img.onload, layout() and component mount re-apply s.lastP with one coalesced paint (on mount read the current value once via scrollYProgress.get() — never wait for a change event, or a mid-page reload strands a blank plate). Guards (non-negotiable): skip repaint while |Δp| < 1/cols; coalesce to one paint per animation frame; MONOTONIC — reverse scroll holds, never un-prints. At the p ≥ 0.98 lock, in order: one final fully-settled paint (colOff.fill(0) + paint(), so the fade never starts from a frame the Δp guard skipped), then the existing fade-to-colour exactly once ("signal locks"). Reduced motion in scrub mode: colour image immediately, canvas never painted (same as resolve's reduced path).
   b. Wake: a new handle method enableWake()/disableWake(), active ONLY when s.settled && s.faded (never before the colour lock) — pointermove deposits gaussian energy (peak ~0.35 × the materialize noise amplitude, radius ≈ ±14 columns) into a per-column Float32Array; a rAF loop paints energized columns, decays energy ×0.88 per frame, and TERMINATES the loop + re-fades when max energy < 0.02. CRITICAL — the wake needs its OWN paint path, because two things make "colour shows through" impossible with the existing one: the canvas element carries an opaque bg-bg class, and resolve-mode paint() fills an opaque bg backing before inking. So: on wake start set the canvas element's background transparent (cvs.style.backgroundColor = "transparent") and snap opacity to 1 with the transition cleared; the wake painter does clearRect(colX, 0, colWidth, height) per energized column then draws ink lines only — it never calls paint() and never draws the bg backing; on wake end restore the background and re-fade. Add an s.waking flag; the MutationObserver early-returns on s.waking exactly as it does while fading. The image ripples where you touch it and heals behind you — pool water, not glitch. Gate pointermove: (hover:hover) and (pointer:fine) and not reduced-motion. After pointerleave the rAF count must provably return to zero (devtools check).
2. Hero: the boxed band becomes a full-bleed chapter plate the text physically touches (rewrite HeroBridgeBand.tsx):
   a. Breakout: move the band OUT of the px-carrying content div (sibling wrapper in Hero.tsx — that div then holds HeroOpening alone): relative w-full h-[52svh] sm:h-[64svh] overflow-hidden, no aspect box, no .terminal-card frame; the plate is full-bleed by construction (w-full on a gutterless section — do NOT use vw units here, they include the Windows scrollbar width). Inside: DitherMedia mode="resolve" transition="scrub" cell={3} (note: the MAX_CELLS clamp coarsens this to ~6–7.5px cells on desktop full-bleed — bolder print lines at cinema scale, accepted look). Parallax by OVERSIZE, not scale: the media layer (the DitherMedia wrapper, canvas included) is 112% of the plate height at top:-6%, and the scroll-linked transform is translateY(-6% → 6%) ONLY — no scale; a fractional upscale would moiré the Bayer line grid. LCP: render the colour <img> in the server HTML unconditionally with fetchpriority="high" (it is already <link rel=preload>ed) — gate ONLY the canvas/scrub layer on introDone — so if the plate's visible crest wins the LCP contest it still paints at first paint; accept the brief plain-image peek pre-hydration on repeat visits.
   b. Aperture: two absolutely-positioned bg-bg curtain panels, left and right, each w-[max(0px,calc((100%-68rem)/2+2rem))] — % of the band equals clientWidth so Windows classic scrollbars cannot skew the aperture, and +2rem matches the sm+ px-8 gutter so the closed aperture aligns with the text column. Note this is a ≥68rem-viewport beat: below ~1088px the curtains compute to zero width and only the scrub print plays — correct behaviour, not a bug. framer-motion useScroll({ target: band, offset: ["start end", "center center"] }) drives their scaleX 1→0 (transform-origin left/right) AND setProgress(p) on the dither — the plate prints line-by-line and unclamps to full bleed as the reader scrolls in, colour blooming precisely as the curtains hit open.
   c. Collisions: change the Hero.tsx opening wrapper from min-h-[100svh] to min-h-[88svh] so the plate's crest peeks above the fold (that peek IS the scroll cue's payoff); give the band -mt-16 sm:-mt-24 so it slides up under the scroll cue. The cue lives in src/components/hero/HeroOpening.tsx (the mono "Scroll" span above the 1px animated line, last child of the wrapper): put its label on a bg-bg px-2 chip, and — because framer's entrance animations create temporary stacking contexts that would defeat a chip-level z-index — give the WHOLE content-column wrapper (or at minimum the CTA row + cue block) relative z-10, so the opening stacks above the band as a unit and stays clickable on short viewports. HeroMetrics moves out of the px-carrying div alongside the band: relative z-10 mx-auto w-full max-w-content px-5 sm:px-8 -mt-12 sm:-mt-16, the dl row on a border border-line bg-bg/95 strip — a caption plate cutting across the image's bottom edge (CountUp untouched; the plate masking the wake along its own strip is intended).
   d. Caption chip: absolute bottom-left mono chip on the plate (same recipe as FacetCard's label chip): "FIG. 00 — THE BRIDGE". Enable the wake on THIS plate only — it is the site's single cursor signature.
   e. Reduced motion: curtains pre-opened (scaleX 0), no parallax, colour image immediate. Kill the old mb-12 sm:mb-16 under the band.
3. Facets become an INDEX + CONTACT SHEET (Facets.tsx becomes "use client" and owns the choreography; FacetCard's API grows but cards stay transform-only — NEVER animate card widths, that triggers the ResizeObserver→getImageData cascade):
   a. Layout lg+: grid-cols-[15rem_1fr] gap-10. Left rail: a mono index (01 THE CURIOUS … 04 THE PAINTER), each row a focusable button styled like the CTA links (underline draw on hover/focus) with that facet's caption underneath in text-muted — the captions LEAVE the cards (delete the figcaptions; labels stay as on-image chips).
   b. Cross-wiring (the memorable beat — hovering TEXT controls the IMAGE). Today FacetCard creates its DitherMediaHandle ref internally and exposes nothing, and Facets.tsx is a server component — so: convert Facets.tsx to "use client"; extend FacetCard's props with an onHandle callback (or forwardRef) surfacing its DitherMediaHandle, active/dimmed booleans, and an onActivate callback. Facets holds activeIndex + the handle refs. Hover/focus on rail row i → cards[i].scramble(400) + playVideo() + a translateY(-8px) lift driven by the active prop; hover/focus on card i → onActivate highlights rail row i. The label chip's underline is driven by the active prop, NOT group-hover, so rail-driven activation lights it too. Rack-focus veil: while anything is active, the OTHER three cards get a bg-bg/40 opacity-only wash via dimmed (300ms). Neighbor ripple: the active card's neighbors fire scramble(250) delayed distance×60ms — with a 700ms per-card cooldown ref so pointer jitter can't machine-gun it. Keyboard parity is mandatory: focus fires exactly what hover fires, and focus-driven activation must NOT be gated behind the existing fine-pointer check (keyboard users on coarse-pointer devices get the full response).
   c. Asymmetric cluster: the four cards on a 12-col grid, col spans 4/3/3/2, card 2 and 4 at lg:mt-10, card 1 at lg:-mt-6 rising above the cluster's top edge (the marker + hairline + margins above mean it will not literally reach the education border — the offset is about breaking the flat grid line, keep the rationale honest). Entrance stagger: bump the appear delay from i*0.08 to i*0.14 so the four materializes read as one left-to-right wave. NO ghost outline word behind the cluster (explicitly rejected as templated).
   d. Mobile: keep the existing snap-x strip untouched; just tighten the band's top margin (see 6).
4. Chapter rail (new src/components/ChapterRail.tsx, mounted in page.tsx ONLY — the root layout also wraps /admin, which must not get the rail; hidden below lg): fixed right-edge vertical instrument rail — mono ticks 00 PROLOGUE / 01 ABOUT / 02 SKILLS / 03 WORK / 04 CONTACT at ~0.62rem tracking-[0.3em]. Export Nav.tsx's module-private links array (or move it to a shared module) and derive the rail's labels/anchors from it — do not duplicate the list. A 1px bg-bridge needle whose scaleY tracks overall scroll progress, active chapter via IntersectionObserver, click → lenis.scrollTo(el, { offset: -80 }) exactly like Nav's own choose() does (a bare scrollTo ignores CSS scroll-padding and lands sections under the fixed header; the native fallback picks scroll-padding up automatically). aria: <nav aria-label="Chapters">; ticks are real links. Static under reduced motion (no needle animation, links still work).
5. Menu signal wipe (Nav.tsx): REPLACE the overlay panel's current y:-100%→0% slide with the texture wipe — a one-shot column sweep over the panel, ≤450ms (Nav.tsx already contains its own local Bayer/flick helpers driving the corner noise canvas — reuse those, not the Preloader's), then remove the wipe canvas; retime the link stagger's delayChildren (currently ~0.55s, tuned to the old slide) to start as the wipe clears (~0.4s). Menu ONLY — do not add it to the preloader (repeating the trick devalues it). Reduced motion: instant appearance, no wipe.
6. Density execution (the whitespace kill — apply intent even if exact classes differ):
   - Section shells: About + Projects py-28 sm:py-40 → py-16 sm:py-24; Skills band → py-14 sm:py-20; Contact → py-20 sm:py-28 (the ONE generous exhale — tight-tight-breathe is the rhythm).
   - Hero: TranslationPanel wrapper py-20 sm:py-24 → pt-12 pb-16 sm:pt-14 sm:pb-20.
   - About internals: heading→lead mt-14 sm:mt-20 → mt-10 sm:mt-12; education block mt-16 sm:mt-20 → mt-12; Facets mount mt-24 sm:mt-28 → mt-14 sm:mt-16.
   - SectionHeading ghost numerals: -top-6 → -top-14 sm:-top-20, opacity → ~0.16 — under the new tighter paddings each numeral rises into its section's top padding and closes the visual gap at the seam. (It will NOT literally cross into the previous section: the offsets roughly equal the new top paddings, and #skills carries overflow-hidden that clips at its boundary — that is fine, do not remove it.)
   - Full-bleed set: the hero plate is full-bleed by construction (2a — no vw units). The vw breakout (w-screen mx-[calc(50%-50vw)]) applies ONLY to the Skills marquee (a direct section child currently at -mx-5 sm:-mx-8, already viewport-centered). LEAVE the Work drag strip inside its bordered card — it sits in the timeline's pl-8 column where a vw breakout would miscenter it and cross the card's border. Add overflow-x: clip on html AND body; accept the ~half-scrollbar off-centre on the marquee under Windows classic scrollbars (its edges are in motion, invisible in practice). Reading columns stay max-w-content — density comes from imagery bleeding, not cramped text.
7. If the phase runs long, cut in this order: wake first, then scrub (fall back to the existing timed materialize). NEVER cut the density moves or the full-bleed hero — those are the actual complaint.

CONSTRAINTS: No pins/scroll-hijack anywhere; no new dependencies; transform/opacity/canvas-paint only; zero CLS (fixed heights + max() clamps); the zero-idle invariant holds after every interaction; no glyph-shuffle text effects; text over imagery always sits on bg-bg/85–95 plates at AA contrast in both themes; content stays props-driven; admin/lib/schema untouched; TypeScript strict.

VERIFY: `npm run build` passes. Lighthouse mobile ≥ 90 / a11y ≥ 95 on the production build, and confirm the LCP element identity at 375×667 AND 390×844 (see 2a — the plate crest competes with the headline). Hero: plate prints line-by-line under scroll, curtains unclamp to full bleed, colour locks at open, metrics plate laps the image bottom, cursor wake ripples and HEALS (rAF returns to zero after pointerleave — check in devtools Performance; a reload landed mid-page must show the plate at the correct scrub state, not blank). Facets: rail hover scrambles its card + veils the others, card hover highlights its rail row, keyboard focus does everything hover does, mobile strip unchanged. Chapter rail tracks and jumps correctly (anchor lands respect scroll-padding). Menu wipe plays once per open, ≤450ms. No horizontal scrollbar at 375px or on Windows classic-scrollbar browsers (overflow-x clip). Reduced motion: every effect static/instant, colour images immediate, rail links work. Both themes; admin regression (login + save + own palette). Commit "phase 10: pressroom — full-bleed plates + cross-wired facets + density".
```

---

## PHASE 11 — Base of operations: the Sri Lanka map plate

Inspired by izanami-official.com/company — a dark globe plate where only the owner's country
glows. No WebGL, no runtime map libraries: the globe is generated once at build time into static
SVG paths; motion is CSS/framer only.

```text
CONTEXT: Next.js 14 App Router portfolio, phases 0–10 already applied and committed — confirm with git log that HEAD is the "phase 10: pressroom" commit; do NOT re-run any earlier phase. Contact (src/components/Contact.tsx) is the closing chapter: giant serif display statement, oversized email link, minimal editorial form whose EmailJS/mailto logic is OFF-LIMITS (visual wrapper edits only); Contact keeps the page's generous padding. House systems available: .terminal-card hairline frames; the FIG. caption chip recipe (mono chip, bg-bg/85 px-2.5 py-1.5 text-[0.62rem] tracking-[0.18em] — as used on FacetCard labels and the Phase 10 hero plate); MotionReveal / Magnetic in src/components/motion/; global grain; green palette as bare RGB triplets (light --bridge 22 101 68 pine, dark --bridge 104 200 150 mint); reduced-motion discipline everywhere. Content is props-driven; Contact already receives the full profile from page.tsx and renders profile.location — just pass profile.location (or profile) into BaseMap, no page.tsx change needed. Admin/lib/schema off-limits. NOTE: class/structure claims come from an audit — apply intent if exact strings differ.

GOAL: An izanami-style cartographic plate closing the site: a cropped dark globe of her corner of the world (East Africa → Japan arc), every country a muted silhouette, SRI LANKA alone glowing luminous green with a radar pulse — quietly alive (slow drift, lock-on entrance), never busy.

DO:
1. Build-time asset (no runtime deps): add devDependencies d3-geo, topojson-client, world-atlas (all small pure JS; world-atlas BUNDLES Natural Earth data — no network fetch). Create scripts/make-map.mjs:
   - Load the atlas JSON portably (bare JSON imports break across Node versions): const require = createRequire(import.meta.url); const topo110 = JSON.parse(readFileSync(require.resolve("world-atlas/countries-110m.json"), "utf8")); — same for countries-50m.json. d3-geo is ESM-only: keep the script .mjs with named imports (import { geoOrthographic, geoPath } from "d3-geo"; import * as topojson from "topojson-client").
   - Data (EMPIRICALLY VERIFIED — follow exactly): merged land from countries-110m.json; Sri Lanka's geometry ALWAYS from countries-50m.json. At 110m Sri Lanka is a 10-point blob that misses the Jaffna peninsula; at 50m it is the recognizable 92-point teardrop costing ~1.4 KB. Identify it by feature properties.name === "Sri Lanka" (or string id "144" — ids are STRINGS, a numeric 144 compare silently matches nothing, and 3 geometries have no id at all, so prefer the name). NEVER use 50m for the land layer — its merged path is ~515 KB, 4× the budget.
   - Projection (validated working values — use them verbatim, do not re-tune): geoOrthographic().rotate([-80, -12]).scale(920).translate([800, 620]) on a 1600×900 viewBox. The translate-y sits BELOW the frame center (450) — that is what makes the sphere edge cut only the TOP corners while the bottom corners stay on the globe. Expect lankaPoint ≈ [799, 700] (horizontal center, ~78% down); the Africa→Japan arc lands as Nairobi (170,780) → Mumbai (693,505) → Tokyo (1445,173), ~98 countries in frame.
   - Merge the land into ONE path with topojson.merge(topo110, topo110.objects.countries.geometries.filter(g => g.properties.name !== "Sri Lanka")) — this dissolves shared borders into a single MultiPolygon (concatenating per-country paths would double-draw every border). geoPath(projection) with no canvas context returns SVG path strings; the sphere path is geoPath rendering { type: "Sphere" }.
   - Emit src/components/contact/world-map.ts exporting sphere, land, lanka (path strings), lankaPoint, viewBox. Expected size ≈ 50 KB total (land ~47 KB; optionally geoPath(projection).digits(1) trims it to ~35 KB with no visible difference at plate scale). Run once, commit the script + generated file.
2. Component src/components/contact/BaseMap.tsx ("use client"): a full-content-width plate, aspect-[16/10] sm:aspect-[21/9], ALWAYS-DARK in both themes. CASCADE TRAP: .terminal-card sets background-color: transparent and is defined after @tailwind utilities, so `terminal-card bg-ink` on ONE element renders transparent in light theme — use an outer <div className="terminal-card"> with an inner absolute inset-0 <div className="bg-ink dark:bg-surface"> carrying the fill and the svg (in light theme the dark plate reads as a framed photo plate, deliberately). The <svg> renders absolute inset-0 h-full w-full with preserveAspectRatio="xMidYMid slice" — the default "meet" letterboxes; slice cover-crops the 1600×900 drawing into both plate ratios (at 21/9 the visible y-window is ~107–793, and lankaPoint at y≈700 keeps ~90px of ocean below the point inside the crop). Contents:
   - the sphere filled by a very faint radial gradient (SVG radialGradient, ~5% white at upper-left fading to 0 — the globe shading in the reference),
   - the land path fill-only, no strokes: className fill-bg/20 dark:fill-ink/15 (muted silhouettes),
   - the lanka path filled rgb(104,200,150) (hardcode the mint — the plate is always dark, so the light theme's deep pine would not glow) with filter: drop-shadow(0 0 6px rgba(104,200,150,0.65)),
   - at lankaPoint: a 2px core dot + two radar rings (SVG circles, stroke mint, CSS keyframes animating r/opacity over ~3.2s, second ring delayed 1.6s, infinite),
   - label like the reference: "SRI LANKA" in font-serif uppercase tracking-[0.25em], below-left of the point with a 1px leader line. THEME TRAP: the plate is always dark but --bg flips to near-black in dark theme, so a fill-bg/90 label would vanish there — use fill-bg/90 dark:fill-ink/90 (mirroring the land fill's flip), and apply the same flip to the leader-line stroke and the bottom-right meta text,
   - caption chip bottom-left (FIG. recipe): "FIG. 05 — BASE OF OPERATIONS" (numbering note: the site's only other figure is FIG. 00 on the hero plate — FIG. 01–04 do not exist anywhere; 05 is deliberate, one past the four numbered chapters. FacetCard chips share the class recipe only, not FIG numbering — do not renumber or hunt for missing figures); bottom-right a mono meta line: {location from props} · 07.03° N / 79.92° E · UTC+05:30.
3. Motion (a little, tasteful):
   - Entrance (inView once, MotionReveal-style): land fades 0→1 over ~0.9s; at +0.4s Sri Lanka "locks on" — fill + glow snap in with ONE expanding ring burst, then the label draws in.
   - Idle: the whole map group drifts translateX(-1.5% → 1.5%) over ~45s alternate ease-in-out (the izanami slow-rotation feel, no WebGL) and the radar rings loop; add an IntersectionObserver that toggles animation-play-state: paused on the rings/drift when the plate is off-screen.
   - Fine pointer only: the plate translates ~1% toward the cursor. Magnetic fits a block child ONLY with className="w-full" (its display:inline-block is an inline style you cannot override via class) AND strength ≈ 0.015 — the 0.25 default is link-scale and would throw a full-width plate ~150px sideways; it translates only, never tilts. If tilt is wanted, write a 10-line local variant instead.
   - Reduced motion: everything static — glow on, rings hidden, no drift, label visible.
4. Placement: inside Contact, between the display statement and the links/form grid (or immediately after the form if the current structure reads better — pick ONE and keep the section's existing padding). The plate is the site's final image before the Footer.
5. a11y/perf: svg role="img" aria-label="Map of the Indian Ocean region with Sri Lanka highlighted — current base of operations"; decorative rings/gradient need no labels; all animation transform/opacity; the aspect box means zero CLS; report the generated file's size in the commit message body.

CONSTRAINTS: d3-geo/topojson-client/world-atlas are BUILD-TIME only — nothing in src/ imports them except via the generated static file; EmailJS/mailto logic untouched; both themes (the plate is always dark by design); TypeScript strict; no new runtime dependencies; transform/opacity-only animation.

VERIFY: `npm run build` passes and the bundle delta from world-map.ts is ≈ 50 KB (< 120 KB hard budget — if it is ~500 KB, 50m data leaked into the land layer; report the number). The plate renders as a dark globe crop in BOTH themes; Sri Lanka glows mint with pulsing rings and a serif label; entrance lock-on plays once per view; the drift is barely perceptible over ~45s; rings/drift pause off-screen (check in devtools); reduced motion = fully static with glow on; 375px: plate fits with no horizontal overflow, label still legible; form still submits (or mailto fallback opens). Commit "phase 11: base of operations map".
```

---

## PHASE 12 — Full-page contact scene (the izanami treatment)

Phase 11 framed the map as a plate; this phase makes the map the room. The whole Contact chapter
becomes a full-viewport always-dark cartographic scene with the contact content floating on top —
izanami-official.com/company, in the house language.

```text
CONTEXT: Next.js 14 App Router portfolio, phases 0–11 committed (confirm HEAD is "phase 11: base of operations map"; do NOT re-run earlier phases). Current Contact (src/components/Contact.tsx): closing chapter on the page palette — chapter heading, giant serif display statement ("LET'S BUILD THE bridge."), intro copy, contact links, EmailJS form whose logic/validation/status handling is OFF-LIMITS (visual wrappers only), and the Phase 11 BaseMap plate (src/components/contact/BaseMap.tsx): a .terminal-card aspect-boxed always-dark plate over src/components/contact/world-map.ts (sphere/land/lanka path strings, lankaPoint ≈ [799,700], viewBox 1600×900, svg preserveAspectRatio="xMidYMid slice", fills fill-bg/20 dark:fill-ink/15, Sri Lanka mint rgb(104,200,150) + radar rings + serif label + leader line, FIG. 05 chip, mono meta line, lock-on entrance + ~45s drift + off-screen pause). ChapterRail (fixed right edge, active chapter via IntersectionObserver, bg-bridge needle). Nav bar gains translucent bg-bg/80 + blur after the hero. Palette: bare RGB triplets in globals.css; the .dark block's values are bg 17 22 19 / surface 24 30 26 / surface-2 33 41 36 / ink 235 233 224 / muted 158 166 156 / line 52 60 54 / warm 212 165 100 / cool 138 164 192 / bridge 104 200 150. Global grain overlay sits above everything at 3%. Admin (src/app/admin/**) + both .admin-theme blocks + src/lib/** + content schema off-limits. Class claims come from an audit — apply intent if strings differ.

GOAL: Contact becomes a FULL-PAGE izanami scene: the globe fills the entire section edge-to-edge, always dark in BOTH themes, with every piece of contact content floating on top of the map. The palette cut from ivory page to black scene is the finale beat.

DO:
1. Add .plate-dark to globals.css (place near the .tone-capture/.tone-invert utilities): a class that assigns ALL NINE variables the .dark block's values verbatim (--bg: 17 22 19; --surface: 24 30 26; --surface-2: 33 41 36; --ink: 235 233 224; --muted: 158 166 156; --line: 52 60 54; --warm: 212 165 100; --cool: 138 164 192; --bridge: 104 200 150). Inside it, every var-based utility (text-ink, border-line, bg-surface, the focus ring on --cool, ::selection on --bridge) renders dark-mode styling regardless of theme. Do not touch the .admin-theme blocks.
2. Contact.tsx restructure (VISUAL ONLY — form logic, validation, status messages, EmailJS/mailto untouched):
   - The <section> becomes the scene: relative w-full min-h-[100svh] plate-dark bg-bg overflow-clip — overflow-CLIP, not overflow-hidden: an overflow:hidden ancestor becomes the sticky backdrop's scroll container and the map stops sticking; overflow:clip creates none.
   - STICKY BACKDROP (crop-math verified — cover-the-section scaling breaks: a tall lg section zooms the map ~1.56× into a blurry close-up, and on mobile the ~1400–1600px single-column section crops the x-window to ~211 units, erasing the label on every real phone): the section's FIRST child is <div className="sticky top-0 h-[100svh]" aria-hidden> holding BaseMap absolute inset-0; the content wrapper follows as relative z-10 -mt-[100svh]. The visible crop is then always the viewport window — rings and label stay design-size at every section height, zero CLS holds.
   - BaseMap changes: strip ONLY the bg-ink dark:bg-surface classes from its inner fill div — the div itself STAYS (it carries the map-paused off-screen toggle and, until step 3 moves them, the chip/meta anchors); delete the .terminal-card frame and the aspect box; the plate becomes absolute inset-0 h-full w-full (put the positioning on or above the Magnetic wrapper, which stays per step 5). Drop Contact's MotionReveal wrapper around BaseMap — a backdrop doesn't do an entrance slide. The svg keeps viewBox 1600×900 but preserveAspectRatio changes to "xMidYMax slice" — byte-identical at every ≤16:9 frame, and on ultrawide frames the crop anchors to the drawing's bottom edge so island + label survive any aspect (plain xMidYMid loses Sri Lanka entirely on a 32:9 fullscreen).
   - Content floats above (inside the -mt-[100svh] wrapper): mx-auto max-w-content px-5 sm:px-8 py-20 sm:py-28, grid lg:grid-cols-[1fr_minmax(0,26rem)] gap-x-16. The narrow right-anchored panel is CROP-MATH CRITICAL: at a naive 1fr/1.1fr split the panel's left edge lands ~4px right of the island at EVERY lg width, with the radar rings and the 45s drift running underneath it; 26rem puts the panel edge at ~59–60% of the viewport, clearing the worst-case ring+drift envelope (~55%). LEFT column: the display statement (the italic "bridge" now renders luminous mint via --bridge automatically) and the intro copy ONLY — keep left-column content above ~62% of scene height so the island band (~77% down) stays clear. RIGHT panel: the form AND the contact links (links move into the panel, below the form). Panel treatment at lg+ ONLY: lg:border lg:border-line lg:bg-bg/60 lg:backdrop-blur-[2px] — backdrop-filter over the animating rings re-blurs every frame (fine on desktop, a real frame-rate cost on low-end phones), so below lg the form sits on a solid bg-bg/85 block or the scrim with NO backdrop-filter. Inputs keep their border-b editorial styling — colors flip via plate-dark. The coordinates meta line lives in NEITHER column — it moves to the scene's bottom-right in step 3.
   - Legibility: the big serif statement may sit raw on the dim land silhouettes; body-size text gets help — an aria-hidden absolute gradient scrim behind the left column (from bg/60 to transparent, wide and soft). Small text over the map must always have either the scrim or a panel under it (the Phase 10 rule).
3. Izanami details:
   - Move the FIG. 05 chip to the scene's bottom-left and the coordinates meta line to the bottom-right (inside the content gutters, absolute against the section).
   - Add the vertical edge marker (their "COMPANY" gesture): "04 — CONTACT" in mono uppercase tracking-[0.3em] text-muted, writing-mode: vertical-rl, pinned to the scene's left gutter at mid-height, hidden below lg, aria-hidden (the real heading below covers semantics).
   - SectionHeading already sits INSIDE the section, so under plate-dark it re-tones to the dark palette automatically (hairline, marker, h2 and ghost-numeral stroke are all var-based) — the decision is editorial, not technical: either keep it as the on-scene heading (restyled for free) or replace it with a visually-hidden h2 ("Contact") so the section keeps its accessible heading and the "04" numbering; drop the ghost numeral if it muddies the map.
4. Label re-anchor (crop-math verified — the current end-anchored below-left label collides with the LEFT column at lg and clips to ~1.5 glyphs on phones): center it BELOW the point — textAnchor="middle", x = px, y = py + 52, fontSize 16, letterSpacing 0.18em (~112 user units wide); the leader line becomes a short vertical tick from (px, py+6) to (px, py+34). This keeps the label's right edge at ~54% of the viewport (clear of the 26rem panel at ~59%) and fits the mobile x-window. With the sticky backdrop the crop always equals the viewport, so checking the standard sizes in VERIFY suffices.
5. Collapse EVERY dark: dual in BaseMap.tsx to its ink-toned (dark:) half — under plate-dark in light theme the .dark ancestor class is absent, so the base halves win and resolve near-black-on-black. There are FIVE, by role: (1) the inner fill div's bg-ink dark:bg-surface → DELETE both classes outright (keeping bg-ink would paint the whole scene IVORY in light theme — the section owns the fill now); (2) land → fill-ink/15; (3) leader → stroke-ink/60; (4) label → fill-ink/90; (5) the coordinates meta line → text-ink/70 (currently text-bg/70 dark:text-ink/70 — the easy one to miss; invisible in light theme if kept). The FIG chip (bg-bg/85 text-ink, no dual) needs no change. Rationale, for future audits: inherited custom properties resolve by tree proximity — .plate-dark declares the vars ON the section while :root/.dark declare on <html>, so the section's values win; there is no specificity fight. Sphere gradient, mint hardcode, rings, drift, off-screen pause, pointer translate unchanged — EXCEPT the lock-on entrance threshold: with a section-sized plate, useInView amount: 0.35 is unreachable once the section exceeds ~2.85 viewports (short-landscape phones) and the map would stay blank forever — drop it to amount: 0.15 or observe a small sentinel div instead.
6. ChapterRail on-dark fix: when the rail's active chapter === "contact", swap the tick TEXT colors to light tones — active text-ink and inactive text-muted/50 both resolve dark in light theme and vanish over the scene. The bg-line tick bars and needle track are ALREADY light in light theme — leave them. The two bg-bridge elements (active tick bar + progress needle) drop to ~2.6:1 pine-on-black in light theme — swap them to the mint value while on-scene, or explicitly accept them dim (they are decorative/aria-hidden). Note: the IO fires around the viewport middle, so the color swap lags the scene edge by design — the existing 300ms transitions cover the handoff; do not chase that as a bug. Nav bar: it carries bg-bg/80 + blur when revealed, so it stays legible over the scene — confirm visually, change nothing unless broken.
7. Footer stays on the normal page palette after the scene — the snap back to ivory/charcoal is the deliberate end-beat. (If it reads better continuous, extending plate-dark to the Footer is allowed — implementer's judgment; state which was chosen.)

CONSTRAINTS: Form logic/validation/status and content plumbing untouched; both themes (the scene is identical dark in both; the rest of the page is unaffected); reduced motion = static scene, glow on, no rings/drift; TypeScript strict; no new dependencies; transform/opacity/canvas-paint + the existing CSS keyframes only; zero CLS (min-h + absolute layers); LCP unaffected (scene is far below the fold).

VERIFY: `npm run build` passes. Contact renders as a full-viewport dark globe scene in BOTH themes; the backdrop STICKS while the content scrolls over it (if the map scrolls away with the page, an overflow-hidden ancestor became its scroll container — it must be overflow-clip); statement/links/form legible on the map (body text carried by scrim/panel — spot-check AA), the coordinates meta line included; form submit (or mailto fallback) behaves EXACTLY as before; Sri Lanka + rings + the centered label visible and unobstructed at 1440×900, 1280×800, 375×812 AND one short-landscape size (667×375 — the entrance-threshold case: the map must not stay blank); chapter rail readable over the scene in light theme; nav readable when revealed; reduced motion fully static; no horizontal overflow; Lighthouse a11y ≥ 95 holds. Leave the global grain untouched — it is imperceptible over the scene and that is fine; do not add a per-scene grain boost. Commit "phase 12: full-page contact map scene".
```

---

## PHASE 13 — The one real photograph (About portrait plate)

The site is deliberately anonymous-illustrated everywhere — this phase adds exactly ONE real
photograph, presented in the house language so it lands as the payoff of that anonymity. The
asset itself (public/media/portrait.jpg) is produced in the planning session (Higgsfield
identity-preserving restyle of a real photo) BEFORE this phase runs — do not run this phase until
that file exists.

```text
CONTEXT: Next.js 14 App Router portfolio, phases 0–12 committed (confirm HEAD is "phase 12: full-page contact map scene"). About (src/components/About.tsx) currently opens with the chapter heading, then an oversized serif pull-quote (the first about paragraph), then the remaining paragraphs in two columns on lg+, then education/additional list rows, then the facets index + contact-sheet band. DitherMedia (src/components/dither/DitherMedia.tsx) supports mode="resolve" (dither materialize → fade to the real image), imperative scramble(duration), reduced-motion = real image immediately. The FIG plate system: FIG. 00 = hero bridge plate, FIG. 05 = contact map (01–04 deliberately unused until now — the portrait claims FIG. 01; the numbering note inside the Phase 11 text predates this and is superseded). Media manifest at src/data/media.ts (heroMedia + facets). Asset contract: public/media/portrait.jpg exists, 4:5 portrait ratio (~1200×1500), a real photograph of Senudi (AI-assisted professional restyle). Admin/lib/schema off-limits; content via props (profile.name, profile.headline available where About/page passes them — check and pass down if needed). Class/structure claims from audit — apply intent if strings differ.

GOAL: A portrait plate opening the About chapter — the ONLY real photograph on the site — rendered through the dither-resolve treatment so the chapter literally resolves from stylised anonymity into the real person.

DO:
1. Manifest: add to src/data/media.ts — export const portraitMedia: MediaAsset = { image: "/media/portrait.jpg", video: null, alt: "Senudi Rupasinghe — portrait" }; extend the top comment: unlike the facet illustration studies, this is a real photograph (AI-assisted restyle of an actual photo).
2. About opening restructure: on lg+, a grid — portrait plate LEFT (roughly a 2/5 column), pull-quote + paragraphs RIGHT (3/5); below lg the plate sits between the pull-quote and the paragraph columns at max-w-[22rem]. Keep every existing paragraph/education/facets element and their content plumbing untouched.
3. The plate: outer <div className="terminal-card"> wrapping an aspect-[4/5] overflow-hidden inner (remember the terminal-card transparent-background cascade — any fill goes on the inner div); inside, <DitherMedia mode="resolve" src={portraitMedia.image} alt={portraitMedia.alt} cell={2.5} /> (lazy — it is below the fold; do NOT priority-load). FIG chip bottom-left over the image (the FacetCard chip recipe): "FIG. 01 — THE PERSON BEHIND THE BRIDGE". Under the frame, a mono caption line from props: {profile.name} · {profile.headline}.
4. Interaction parity with the facets: hovering OR keyboard-focusing the plate fires scramble(400) with the same ~700ms cooldown ref pattern FacetCard uses; the wrapper is focusable with a visible focus ring.
5. Reduced motion: the photograph renders immediately, static (DitherMedia already handles it) — the one real photo must never be hidden behind an effect for reduced-motion users.

CONSTRAINTS: No schema/admin/lib changes; both themes; TypeScript strict; transform/opacity/canvas-paint only; images lazy below the fold; the photograph is shown un-dithered at rest after the resolve — never permanently abstracted.

VERIFY: `npm run build` passes. About opens with the portrait plate materializing → resolving to the photograph; hover/focus shimmer works with keyboard parity; reduced motion shows the photo instantly; 375px stacks cleanly (plate between pull-quote and paragraphs); both themes; alt text present; Lighthouse unchanged. Commit "phase 13: the one real photograph".
```

---

## PHASE 14 — The brutal pass (re-run on the finished site)

PHASE 7 ran against the old tan/umber build. Everything since (green palette, resolve-to-colour
imagery, pressroom hero, cross-wired facets, contact map scene, menu retrofit) has never been
reviewed. This is the polish pass adapted from the $100K pack's "Prompt 4", scored for a recruiter
instead of a contest judge. Run it LAST, after every other phase you intend to ship.

```text
CONTEXT: Next.js 14 App Router portfolio, the full redesign shipped (phases 0–12, the 6.5 menu retrofit, and the Work reorder; PHASE 13's portrait may or may not be in yet — review whatever is actually on the page). Current systems: green editorial palette (ivory paper / green-black ink / pine accent; dark = green charcoal + mint) as bare RGB triplets in globals.css with both .admin-theme blocks untouched; DitherMedia canvas engine (mode duotone|resolve, transition materialize|none|scrub, scramble/wake handles, zero-idle rAF invariant); once-per-session preloader + curtain; Lenis smooth scroll; full-bleed hero plate with scroll-scrubbed print, aperture curtains, cursor wake, metrics plate collision; chapter system with ghost numerals; index + contact-sheet facets with cross-wired hover; Work timeline (newest first, Foundations closing) + drag strip + publication; full-page always-dark contact map scene (.plate-dark, sticky backdrop, Sri Lanka glow); ChapterRail; full-screen menu overlay with dither wipe; global grain; custom cursor ring. Content system (SiteContent props, src/lib/**, src/data/content.ts, zod schema) and admin (src/app/admin/**) are OFF-LIMITS — review them only for regressions.

GOAL: Act as a brutal reviewer of this site, then fix what you find. The persona: a hiring manager in Colombo, on a mid-range Android phone, on hotel wifi, who gave this link 45 seconds between meetings. Everything confusing, janky, slow, unreadable, or broken gets listed and ranked by how badly it hurts that first impression — then fixed.

DO:
1. Walk every screen and every state, and write the ranked issue list BEFORE fixing anything:
   - First visit (preloader plays) AND repeat visit (skipped) AND a mid-page reload (does the scrubbed hero plate restore correctly, or land blank?).
   - Both themes, at 375px and 1440px, with reduced-motion ON and OFF.
   - Keyboard only: tab the entire page — nav, menu overlay, facet rail AND cards, foundations drag strip, chapter rail, every form field. Anything reachable by mouse must be reachable and operable by keyboard, with a visible focus ring on the new dark surfaces.
   - The states the pack insists on, translated for a portfolio: what a first-time visitor sees before anything animates (empty state); what the contact form shows WHILE sending (loading state); what happens when EmailJS fails or is unconfigured (the mailto fallback must still work — verify, do not assume); what a project card with no metric/link renders as.
   - Every button and link label must say what it does in plain words. "See the work", "Download resume", "Send" — flag anything cryptic, and flag any label that only makes sense next to an icon.
2. Fix the top issues from the list. Prioritise by damage to first impression, not by ease.
3. Re-verify the things previous phases promised, since they were written against older code:
   - Zero-idle: after the hero cursor wake settles and after every dither resolve, rAF count returns to zero (devtools Performance).
   - The sticky contact backdrop actually sticks; the map is not blank on short-landscape phones.
   - No horizontal scrollbar anywhere, including Windows classic-scrollbar browsers.
   - Nothing above the fold animates on load except the intended hero sequence.
   - ::selection, :focus-visible, and disabled/error form styling all read correctly on BOTH the ivory page and the dark contact scene.
4. Accessibility floor: run an audit (Lighthouse + manual). Body text ≥ 4.5:1 in both themes AND over every image/scene surface; decorative canvases and ghost numerals aria-hidden; every image has real alt text; headings form a sane outline (one h1, sections h2); the page has a skip-to-content affordance or the nav is the first tab stop.
5. Performance on the target device: `npm run build && npm start`, Lighthouse MOBILE with 4x CPU throttle. Targets: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95. Report first-load JS, LCP element identity, CLS, TBT. If the dither canvases or the map SVG are hurting, fix them (defer, lower cell density, delay non-critical mounts) — do not lower the targets.
6. Admin regression: /admin still logs in, editing + saving a field still updates the public site, admin still renders in its own slate/blue palette untouched by any of the redesign.
7. Content proofread: read every word on the page as a stranger. Typos, inconsistent capitalisation in mono labels, dates that disagree with each other, a stack list that contradicts a project summary, "Ragama, Sri Lanka" formatted differently in two places. Fix copy through the ADMIN PANEL where the field is content-driven (tell me which fields to change); fix hardcoded copy in components directly.

VERIFY: Report back: (a) the ranked issue list with what was fixed and what was deliberately left, (b) Lighthouse mobile scores + LCP/CLS/TBT + first-load JS, (c) the QA matrix results cell by cell, (d) the keyboard pass result, (e) confirmation the contact form + mailto fallback and the admin flow both work end to end. Commit "phase 14: brutal pass".
```

---

## Swapping in real footage of Senudi (later, no code changes)

When short clips of the real Senudi exist (coding, breaststroke, painting, thinking — and optionally
an ambient hero clip), the dither engine makes the swap invisible: everything on the site stays in
the same two-tone language whether the source is an AI still, a phone clip, or pro footage.

1. Compress each clip: 5–8s loop, no audio, 720p-ish, H.264:
   `ffmpeg -i in.mov -an -vf "scale=-2:960" -c:v libx264 -crf 27 -movflags +faststart facet-swim.mp4`
   Aim ≤ 3–4 MB per facet clip, ≤ 6 MB for the hero.
2. Drop files into `public/media/` (keeping `facet-<key>.mp4` / `hero-bridge.mp4` is tidy).
3. In `src/data/media.ts`, set each entry's `video` field (and update alt/captions if needed).
   The stills automatically become poster frames; DitherMedia dithers the video frames live.
4. Optionally replace the stills with real photos at the same paths. Commit and deploy.

Higgsfield image-to-video also works later (needs topped-up credits): animate these exact stills
(kling / seedance class models, 5s, subtle-motion prompts) for visual continuity.

## After the pack

- Deploy to Vercel as usual — the redesign is purely presentational; DB content, env vars, and the
  admin flow carry over unchanged.
- Honesty note: the facet images are AI-generated animation-style illustration studies with
  deliberately anonymous framing — they show Senudi's interests, not her likeness (or anyone
  else's). Combined with the dither treatment this reads as art direction, not photography. If the
  site ships publicly before real footage exists, the captions can stay as-is; a tiny mono footnote
  in the facets band ("illustration studies") is an optional touch of taste.
- Optional later ideas: page-transition dither wipe if subpages are ever added; a dithered image
  field per project card; moving the facets manifest into SiteContent + admin if captions should be
  editable without code; social captions for the launch post (the share card from Phase 8 will do
  the visual work).
