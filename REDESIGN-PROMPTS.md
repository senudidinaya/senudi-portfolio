# Senudi Portfolio — Editorial Redesign Prompt Pack

Goal: elevate the portfolio to a premium, cinematic editorial style (sondaven.com-inspired)
while keeping the admin/content system, both themes, and reduced-motion support intact.

## How to use

1. Open **this folder** (`senudi-portfolio`) in VS Code and start Claude Code here.
2. Run the phases **in order, one at a time**. Start each phase in a **fresh conversation** (`/clear`) so context stays sharp.
3. Keep `npm run dev` running and eyeball the site after every phase. Each phase ends with a git commit, so you can always roll back one phase with `git reset --hard HEAD~1`.

---

## PHASE 0 — Foundation: editorial palette, smooth scroll, motion primitives

```text
CONTEXT: This repo is my Next.js 14 (App Router) + React 18 + TypeScript (strict) + Tailwind 3.4 portfolio. The whole public site renders from one SiteContent object (seed in src/data/content.ts, optionally overridden by Postgres via src/lib/content.ts) — components are presentational and receive content as props. Theming is CSS variables in src/app/globals.css (:root = light, .dark = dark), mapped to Tailwind color names in tailwind.config.ts, with next-themes (darkMode: "class"). There is a private admin panel (src/app/admin/**) whose palette lives in the .admin-theme blocks of globals.css — the admin must not change.

GOAL: I am redesigning the public site into a premium editorial style: near-neutral paper/charcoal palette, oversized typography, cinematic scroll-driven motion. This phase lays foundations only — no component restyling yet.

DO:
1. If this folder is not already a git repo, run `git init` and make an initial commit of the current state before changing anything.
2. `npm install framer-motion lenis`
3. In src/app/globals.css replace ONLY the :root and .dark palette values (keep variable names identical; keep both .admin-theme blocks byte-for-byte unchanged):
   :root — --bg: 247 245 240; --surface: 252 251 248; --surface-2: 240 237 230; --ink: 28 27 24; --muted: 118 114 104; --line: 224 220 210; --warm: 164 108 44; --cool: 70 90 112; --bridge: 44 106 80;
   .dark — --bg: 16 16 15; --surface: 26 25 23; --surface-2: 38 37 34; --ink: 236 233 226; --muted: 152 148 138; --line: 54 52 47; --warm: 214 164 96; --cool: 138 164 190; --bridge: 118 184 150;
4. Add a fixed full-viewport film-grain overlay (inline SVG feTurbulence data-URI background, ~3% opacity, pointer-events-none, aria-hidden, high z-index) rendered once from src/app/layout.tsx so it covers the public site in both themes.
5. Create src/components/motion/SmoothScroll.tsx — a "use client" Lenis smooth-scroll provider (requestAnimationFrame loop, lerp ≈ 0.1) that is a complete no-op when prefers-reduced-motion is set. Mount it in layout.tsx around children. In-page anchor links (#about, #work, #contact) must keep working with the existing scroll-padding-top.
6. Create motion primitives in src/components/motion/ (all "use client", all using framer-motion's useReducedMotion — when reduced motion is on they render fully visible static content):
   - RevealText.tsx — splits a text string into words and reveals them with a masked rise-up stagger when scrolled into view (once). Props: as (element tag), className, delay, stagger.
   - MotionReveal.tsx — block-level fade + rise reveal on inView (same API spirit as the existing src/components/Reveal.tsx, which it will gradually replace).
   - CountUp.tsx — animates a number when it enters view. It must parse content-driven values like "3+", "92%", "2024" (animate the numeric part, keep prefix/suffix); if the value isn't parseable, render it as plain text.
   - Magnetic.tsx — wrapper that translates its child a few pixels toward the cursor on hover (only on pointer:fine devices) and springs back on leave.
7. Extend tailwind.config.ts theme with fluid display font sizes using clamp() — e.g. "display-xl": clamp(3rem, 8vw, 7.5rem) with line-height ~0.95, "display-lg": clamp(2.25rem, 5.5vw, 4.5rem) with line-height ~1.02 — plus a letterSpacing token for tight display tracking. Keep all existing tokens.

CONSTRAINTS: Do not touch src/app/admin/**, src/lib/**, src/data/content.ts, the zod schema, or the .admin-theme CSS. Do not restyle individual components yet (the palette swap restyles everything globally by itself — expected). TypeScript strict must stay clean. All new motion code must be client components; server components stay server.

VERIFY: `npm run build` passes. In `npm run dev`: the site renders in the new paper/charcoal palette in BOTH light and dark; scrolling is buttery; anchor links still land correctly; no hydration warnings in the console; /admin still renders with its own unchanged slate/blue palette. With DevTools emulating prefers-reduced-motion, scrolling is native. Then commit with message "phase 0: editorial foundation".
```

---

## PHASE 1 — Branded preloader + entrance curtain

```text
CONTEXT: Next.js 14 App Router portfolio, Tailwind CSS-variable theming (:root/.dark in src/app/globals.css), framer-motion + Lenis already installed, motion primitives live in src/components/motion/. The site is content-driven from a SiteContent object; admin panel under src/app/admin/** must not change. Everything must work in both themes and respect prefers-reduced-motion.

GOAL: A short branded preloader like high-end studio sites: shown once per browser tab session, then a curtain reveal into the hero.

DO:
1. Create src/components/motion/Preloader.tsx ("use client") and an IntroProvider context (introDone: boolean) so other components can delay their entrance animations until the curtain lifts.
2. Behavior:
   - On first load in a tab session: fixed inset-0 overlay in bg color, above everything. Centered: mono uppercase eyebrow "SENUDI RUPASINGHE", below it one serif italic line: "Between what business needs and what engineering ships." A counter 000 → 100 in mono in the bottom-right corner and a 1px progress hairline that fills. Total duration ≈ 1.4s.
   - Then the whole panel slides up like a curtain with cubic-bezier(0.76, 0, 0.24, 1) over ~0.7s and unmounts. introDone flips to true exactly when the curtain starts lifting.
   - Persist "seen" in sessionStorage (key "senudi_intro_seen"): on any later navigation/reload in the same tab, render nothing and set introDone = true immediately — with zero flash of the overlay.
   - prefers-reduced-motion: never show the preloader at all; introDone = true immediately.
   - Lock body scroll while the overlay is visible; release after.
   - No cumulative layout shift: the page content is fully rendered underneath the overlay the whole time (SEO/SSR unaffected).
3. Mount IntroProvider + Preloader in src/app/layout.tsx (client boundary only around what needs it; keep layout a server component).

CONSTRAINTS: No changes to content files, admin, or lib. TypeScript strict. Both themes (overlay uses bg/ink variables).

VERIFY: `npm run build` passes. Fresh tab → sequence plays once; reload → skipped with no flash; new tab → plays again; reduced-motion → never plays. Commit "phase 1: preloader".
```

---

## PHASE 2 — Editorial hero rebuild

```text
CONTEXT: Next.js 14 App Router portfolio. Hero is src/components/Hero.tsx (server component receiving profile + metrics props from the SiteContent object — all displayed text comes from these props, don't hardcode content that exists in props). Theming via CSS variables (bg/surface/surface2/ink/muted/line + accents warm/cool/bridge) in both :root and .dark. Fonts: font-serif = Newsreader, font-sans = IBM Plex Sans, font-mono = IBM Plex Mono. Motion primitives exist in src/components/motion/ (RevealText, MotionReveal, CountUp, Magnetic) plus an IntroProvider exposing introDone (preloader). Fluid sizes text-display-xl / text-display-lg exist in Tailwind. All animation must respect prefers-reduced-motion (primitives already handle it) and work in both themes.

GOAL: Rebuild the hero as a full-viewport editorial opening with oversized typography and ambient abstract background — no photos.

DO:
1. Make the hero min-h-[100svh] with content vertically composed: status row top, headline center-weighted, metrics at the bottom.
2. Status row: mono uppercase text-xs — pulsing bridge-green dot + profile.openTo on the left, profile.location right-aligned, separated by a 1px hairline underneath.
3. Headline: keep the existing sentence structure ("I build the bridge between what the business needs and what engineering ships.") but set it in font-serif font-light UPPERCASE at text-display-xl, tight tracking, stacked over 3–4 lines. Contrast trick: the word "bridge" stays lowercase italic in text-bridge; "what the business needs" tinted warm; "what engineering ships." tinted cool. Reveal line-by-line with a masked rise stagger that starts only when introDone is true (immediately if preloader was skipped).
4. Tagline (profile.tagline): max-w-xl, text-muted, delayed reveal after headline.
5. CTAs: keep both actions ("See the work" → #work, "Download resume" → profile.resumeFile) but restyle from pills to editorial links: mono uppercase text-xs with an animated underline sweep and a small arrow that nudges on hover; wrap each in Magnetic.
6. Scroll cue pinned near the hero's bottom edge: mono "SCROLL" + a vertical 1px line that subtly draws/loops (static line under reduced motion).
7. Ambient background replacing the current plain grid: keep the blueprint grid but fainter, and add 2–3 large blurred radial aura blobs (warm upper-left, cool right, bridge lower-center) at 5–8% alpha that drift extremely slowly (transform-only keyframes, 30s+ loops, none under reduced motion). Grain overlay already exists globally.
8. Metrics: keep the dl grid and all content, restyle borderless editorial — hairline separators between cells instead of boxed cards, values in serif display size rendered through CountUp, labels mono uppercase tracking-wide; cells stagger in on inView.
9. TranslationPanel: keep the ask → build content exactly, restyle as a flat editorial panel — hairline frame, mono tags "THE ASK" / "THE BUILD" in warm/cool, and the connector arrow's line draws itself when the panel enters the viewport.
10. Split client-side pieces into small "use client" children where needed; Hero itself keeps receiving content via props only (no fetching, no content changes).

CONSTRAINTS: Every piece of text that exists in the content object must still come from props (openTo, location, tagline, theBridge.ask, theBridge.build, resumeFile, metrics). No admin/lib/schema changes. Both themes. TypeScript strict.

VERIFY: `npm run build` passes. Entrance plays after the preloader curtain (and instantly on reload where the preloader is skipped). Reduced motion: everything visible and static. Mobile 375px: headline wraps gracefully via clamp, metrics fall to 2 columns, nothing overflows horizontally. Both themes look intentional. Commit "phase 2: editorial hero".
```

---

## PHASE 3 — Chapter system + About

```text
CONTEXT: Next.js 14 App Router portfolio, content-driven via props from a SiteContent object. Sections (About/Skills/Projects/Contact) use src/components/SectionHeading.tsx (eyebrow + title). Motion primitives in src/components/motion/ (RevealText, MotionReveal, CountUp, Magnetic), CSS-variable theming in both :root and .dark, fonts Newsreader serif / IBM Plex Sans / IBM Plex Mono, fluid display sizes text-display-xl/lg. All motion respects prefers-reduced-motion; admin (src/app/admin/**), lib, and content schema are off-limits.

GOAL: Turn the page into a numbered chapter narrative with big editorial section headings and an editorial About section.

DO:
1. Rework SectionHeading.tsx into a chapter heading:
   - Eyebrow: mono uppercase in the "01 / ABOUT" pattern (normalize whatever eyebrow strings the sections currently pass so the numbering is consistent across About → Skills → Work → Contact in page order).
   - Title: UPPERCASE font-serif font-light at text-display-lg with a masked line reveal on inView.
   - Ghost index: a huge decorative chapter number behind/beside the title (Newsreader, outlined look via -webkit-text-stroke in the line color, ~8–12% opacity, aria-hidden) that drifts slightly with scroll (framer-motion useScroll + useTransform parallax; static under reduced motion).
   - A 1px hairline rule above each chapter heading spanning the content width.
2. Rhythm: standardize all public sections to generous vertical padding (about py-28 sm:py-40) so chapters breathe.
3. About.tsx editorial restyle (all content still from props: about paragraphs, education, additional):
   - First paragraph becomes an oversized serif pull-quote: text-2xl sm:text-3xl font-light text-ink, max-w-3xl.
   - Remaining paragraphs flow in two columns on lg+ (single column below), text-muted.
   - Education and additional info become editorial list rows: hairline top border per row, mono uppercase meta (dates/labels) in a left column, serif content right; on hover the row's left padding eases slightly and the border darkens. Rows reveal with a small stagger.

CONSTRAINTS: No content/schema changes; components stay presentational; both themes; reduced motion = static and fully visible; TypeScript strict.

VERIFY: `npm run build` passes. Chapter numbers read 01/02/03/04 in page order; ghost numerals sit behind titles without causing horizontal overflow at 375px; About stacks cleanly on mobile; both themes. Commit "phase 3: chapters + about".
```

---

## PHASE 4 — Work timeline as a scroll story + Skills

```text
CONTEXT: Next.js 14 App Router portfolio, content-driven via props. src/components/Projects.tsx renders: a "Foundations" card (projects whose kind includes ".NET foundation") + flagship ProjectCards on a vertical timeline (ol with border-l + absolutely positioned dots) + a publication block. src/components/Skills.tsx renders three skill groups (business / shared / technical). Motion primitives in src/components/motion/; CSS-variable theming (warm/cool/bridge accents) in both themes; Newsreader serif + IBM Plex Sans/Mono; prefers-reduced-motion must be respected everywhere; admin/lib/schema off-limits. The ".NET foundation" kind-grouping logic and admin-controlled ordering must not change.

GOAL: Make the Work section feel like a scroll-driven story and give Skills an editorial treatment with one signature moving element.

DO:
1. Projects.tsx timeline:
   - Replace the static border-l spine with a 1px track plus an overlaid progress line whose scaleY is bound to the section's scroll progress (framer-motion useScroll with the section as target + useTransform, transform-origin top). Under reduced motion the line renders fully drawn.
   - Timeline dots scale/fade in when their item enters view.
2. ProjectCard editorial restyle (all fields still from props: timeframe, title, kind, summary, highlights, stack, metric, link):
   - timeframe mono uppercase; title font-serif UPPERCASE text-3xl sm:text-4xl font-light; hairline border card with transparent background that fills to bg-surface on hover; link arrow slides right on hover.
   - Stack chips become a single mono uppercase line separated by interpuncts ( · ) instead of boxed chips.
   - metric.value renders through CountUp.
3. FoundationsCard: keep heading/description, but the inner project mini-cards become a horizontal strip: overflow-x auto with scroll-snap, cards ~w-[260px] flex-none, enhanced with framer-motion drag="x" for mouse dragging, and a mono hint "HOLD & DRAG →" above the strip (hint hidden under reduced motion; native horizontal scroll and keyboard focus must still work as fallback).
4. Publication block: hairline frame, serif title, mono DOI link with animated underline sweep.
5. Skills.tsx:
   - Between the SectionHeading and the groups, add a full-bleed marquee strip: every skill name from all three groups, mono uppercase, separated by " · ", scrolling horizontally in a slow constant CSS-animation loop (list duplicated with aria-hidden for the seamless loop; pauses on hover; completely static under reduced motion).
   - The three groups become editorial columns with mono numbered headers tinted per side (01 BUSINESS in warm, 02 BRIDGE in bridge, 03 TECHNICAL in cool — use the actual group titles from content) and serif items that get an underline sweep on hover.

CONSTRAINTS: Grouping/order logic untouched; content only from props; both themes; TypeScript strict; transform/opacity-only animations.

VERIFY: `npm run build` passes. Timeline line draws in sync with scroll; foundations strip drags with mouse AND scrolls natively on touch/trackpad; marquee loops seamlessly and pauses on hover; reduced motion: spine fully drawn, marquee static, everything visible. Both themes; 375px clean. Commit "phase 4: work + skills".
```

---

## PHASE 5 — Nav, Contact finale, Footer

```text
CONTEXT: Next.js 14 App Router portfolio, content-driven via props. src/components/Nav.tsx is a fixed top bar (links, resume link, ThemeToggle, mobile menu). src/components/Contact.tsx has contact links + an EmailJS form with a mailto: fallback when EmailJS isn't configured — that logic is critical and must not change. src/components/Footer.tsx is the footer. Motion primitives in src/components/motion/; CSS-variable theming both themes; Newsreader/IBM Plex fonts; reduced motion respected; admin/lib/schema off-limits.

GOAL: Finish the narrative: a refined editorial nav, a big closing Contact chapter, and a signature footer.

DO:
1. Nav.tsx:
   - Restyle: name as a small serif wordmark; links mono uppercase text-xs; the link for the section currently in view gets an active underline (track sections with an IntersectionObserver).
   - A 1px page scroll-progress hairline pinned to the very top edge (scaleX bound to overall page scroll progress).
   - After scrolling past the hero, the bar gains a translucent bg/80 + backdrop-blur background; it hides on scroll down and reveals on scroll up (always visible under reduced motion).
   - Keep resume link + ThemeToggle + mobile menu functionality; restyle the mobile menu as a full-screen overlay with big serif links revealed with a small stagger.
2. Contact.tsx:
   - Closing chapter treatment: above the existing contact content, a giant serif UPPERCASE display statement at text-display-xl revealed line-by-line ("LET'S BUILD THE BRIDGE." — hardcode only if no equivalent field exists in the contact/profile content; prefer content fields when present).
   - The email address becomes an oversized serif link with a full-width animated underline on hover.
   - Restyle the form to minimal editorial inputs: transparent backgrounds, border-b hairline only, mono uppercase labels, focus turns the border ink-colored; wrap submit in Magnetic. DO NOT touch the EmailJS/mailto logic, validation, status messages, or content fields — visual changes only.
3. Footer.tsx: editorial finale — the name as a huge serif uppercase wordmark at text-display-lg with ~10% opacity spanning the width, above a mono meta row: © current year, location, and a "BACK TO TOP ↑" link (smooth-scrolls to #top, wrapped in Magnetic).

CONSTRAINTS: Zero changes to form logic and content plumbing; both themes; reduced motion (nav always visible, reveals static); TypeScript strict.

VERIFY: `npm run build` passes. Send a test through the contact form (or confirm the mailto fallback opens) — behavior identical to before. Active nav link tracks scrolling; progress hairline reaches full width at page bottom; mobile menu opens/closes correctly. Both themes. Commit "phase 5: nav + contact + footer".
```

---

## PHASE 6 — Micro-interactions, accessibility + performance QA

```text
CONTEXT: Next.js 14 App Router portfolio that just went through an editorial redesign (phases 0–5): new paper/charcoal palette in :root/.dark, preloader, Lenis smooth scroll, framer-motion reveals/parallax/marquee/drag, editorial nav/hero/sections. Content system (SiteContent props, src/lib/**, src/data/content.ts, zod schema) and admin panel (src/app/admin/**, .admin-theme CSS) were intentionally untouched. Fonts Newsreader + IBM Plex Sans/Mono.

GOAL: Final polish and a rigorous QA pass. This phase mostly verifies and fixes.

DO:
1. Custom cursor (subtle): a small ink-colored follower ring that eases behind the native cursor and scales up over links/buttons. Render it ONLY when (pointer: fine) and (hover: hover) and NOT under prefers-reduced-motion. Keep the native cursor visible (do not hide it).
2. Consistency pass: one easing family everywhere — cubic-bezier(0.22, 1, 0.36, 1) for reveals, cubic-bezier(0.76, 0, 0.24, 1) for the curtain; durations 0.6–0.9s; identical reveal distances. Nothing should animate on initial load above the fold except the intended hero sequence.
3. Accessibility:
   - :focus-visible ring clearly visible against the new palette on every interactive element.
   - Body-text contrast: verify muted-on-bg meets WCAG AA (≥ 4.5:1) in BOTH themes; adjust --muted values if short.
   - Decorative elements (ghost chapter numbers, aura blobs, grain, duplicated marquee list, cursor ring) are aria-hidden; drag strip and marquee content reachable by keyboard.
   - ::selection styled with bridge at ~20% alpha.
4. Performance:
   - Confirm all animations are transform/opacity only; use will-change sparingly; no scroll-linked layout thrash from Lenis.
   - `npm run build` — compare first-load JS before/after; ensure framer-motion imports are tree-shaken (import { motion, useScroll, ... } from "framer-motion", no wildcard imports).
   - Run Lighthouse (mobile) on the production build (`npm run build && npm start`): Performance ≥ 90 and Accessibility ≥ 95 — fix whatever falls short.
5. Full QA matrix — actually check every cell and fix failures: {light, dark} × {375px, 1440px} × {reduced-motion on, off}: no horizontal overflow, no invisible text, no stuck animations.
6. Admin regression check: /admin login works, editing a field and saving updates the public site, and the admin UI still uses its own .admin-theme palette, unaffected by the redesign.
7. Final commit "phase 6: polish + qa".

VERIFY: Report back: Lighthouse scores, the QA matrix results, first-load JS size, and confirmation that the admin flow works end-to-end.
```

---

## After the pack

- Deploy to Vercel as usual — the redesign is purely presentational, so DB content, env vars, and the admin flow carry over unchanged.
- Optional later ideas: page-transition wipe if you ever add subpages; an image field per project if you change your mind about screenshots.
