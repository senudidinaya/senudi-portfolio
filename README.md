# Senudi Rupasinghe — Portfolio

A personal portfolio site built with **Next.js 14 (App Router)**, **TypeScript**,
**Tailwind CSS**, and **next-themes** for dark mode.

The design concept is "between two worlds" — a **warm accent** for the
business/people side and a **cool accent** for the technical/systems side,
meeting at you. Typography pairs a humanist serif (Newsreader) with
**IBM Plex Sans/Mono**, a typeface designed to represent the human–machine
relationship.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To build for production:

```bash
npm run build
npm start
```

## Where to edit things

Almost everything you'll want to change lives in **one file**:

```
src/data/content.ts
```

That's where your name, roles, tagline, metrics, about text, skills, projects,
publication, education, and contact links are defined. Every section reads
from it, so you rarely need to touch the components.

### Swap your resume PDF

Replace `public/Senudi_Rupasinghe_CV.pdf` with your latest CV (keep the same
filename, or update `profile.resumeFile` in `content.ts` to match a new name).

### Make the contact form send real emails

The form works with no backend of your own via [Formspree](https://formspree.io):

1. Create a free account and a new form at formspree.io.
2. Copy your form ID (the part after `/f/`, e.g. `xldkabcd`).
3. Paste it into `FORMSPREE_ID` at the bottom of `src/data/content.ts`.

Until you add an ID, the form falls back to opening the visitor's own email
client pre-filled to your address — so it still works, just less smoothly.

## Deploy

The easiest path is [Vercel](https://vercel.com):

1. Push this folder to a GitHub repo.
2. Import the repo at vercel.com — it auto-detects Next.js. No config needed.
3. Deploy. You'll get a live URL you can add to your CV and LinkedIn.

## Structure

```
src/
  app/
    layout.tsx        fonts, theme provider, metadata
    page.tsx          assembles the sections
    globals.css       theme variables (light + dark), base styles
  components/          Nav, Hero, About, Skills, Projects, Contact, Footer, …
  data/
    content.ts        ← all your editable content
public/
  Senudi_Rupasinghe_CV.pdf
```

## Colors & fonts

Theme colors are CSS variables in `src/app/globals.css` (`:root` for light,
`.dark` for dark) and mapped to Tailwind names in `tailwind.config.ts`
(`bg`, `surface`, `ink`, `muted`, `line`, `warm`, `cool`). Change them in one
place and the whole site follows.
