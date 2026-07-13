# Admin panel — setup

The site content is stored in a database and edited through a private admin
panel. Until you configure the environment variables below, the public site
falls back to the seed content in `src/data/content.ts` and the admin page
shows an "Admin not configured" notice.

## What you need to set

Four environment variables (see `.env.example`):

| Variable | What it is | How to get it |
| --- | --- | --- |
| `DATABASE_URL` | Neon/Vercel Postgres connection string | Provided by Vercel when you attach a Postgres database; locally via `vercel env pull` |
| `SESSION_SECRET` | 32+ char secret that encrypts the login cookie | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of your password | `node scripts/hash-password.mjs "your-password"` |
| `NEXT_PUBLIC_SECRET_WORD_SHA256` | SHA-256 of your secret entry word | `node scripts/hash-word.mjs "yourword"` |

## Deploy on Vercel

1. Push the repo to GitHub and import it into Vercel.
2. In the Vercel project: **Storage → Create Database → Postgres (Neon)** and
   attach it. This sets `DATABASE_URL` automatically.
3. **Settings → Environment Variables**: add `SESSION_SECRET`,
   `ADMIN_PASSWORD_HASH`, and `NEXT_PUBLIC_SECRET_WORD_SHA256`.
4. Redeploy. The `site_content` table is created automatically on first use.

## Local development

```bash
npm install
vercel env pull .env.local     # pulls DATABASE_URL (needs `npm i -g vercel` + `vercel link`)
# then add SESSION_SECRET, ADMIN_PASSWORD_HASH, NEXT_PUBLIC_SECRET_WORD_SHA256 to .env.local
npm run dev
```

## How to use it

1. On any page, **type your secret word** — the admin login opens.
   (You can also just go to `/admin` directly; the login is the same.)
2. Enter your password.
3. Edit any section, then **Save**. The public site updates within seconds.

## Security notes

- The login **password** is the security boundary — checked on the server for
  every save. The secret word and the unlisted route are convenience only.
- The session cookie is encrypted, `httpOnly`, `Secure` (in production), and
  `SameSite=Lax`. Login is rate-limited.
- Rotate the password by regenerating `ADMIN_PASSWORD_HASH`. Rotating
  `SESSION_SECRET` logs out all existing sessions.
- Keep real values out of git; only `.env.example` is committed.
