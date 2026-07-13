import { neon } from "@neondatabase/serverless";
import type { SiteContent } from "@/data/content";

// The Neon (Vercel Postgres) integration sets DATABASE_URL; some setups use
// POSTGRES_URL. Read lazily so the public site still builds without a DB.
function db() {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

let schemaReady = false;
async function ensureSchema() {
  if (schemaReady) return;
  const sql = db();
  await sql`
    CREATE TABLE IF NOT EXISTS site_content (
      id INT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  schemaReady = true;
}

export async function readContent(): Promise<SiteContent | null> {
  await ensureSchema();
  const sql = db();
  const rows = await sql`SELECT data FROM site_content WHERE id = 1`;
  return (rows[0]?.data as SiteContent | undefined) ?? null;
}

export async function writeContent(data: SiteContent): Promise<void> {
  await ensureSchema();
  const sql = db();
  await sql`
    INSERT INTO site_content (id, data, updated_at)
    VALUES (1, ${JSON.stringify(data)}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
  `;
}
