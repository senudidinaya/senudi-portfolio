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
