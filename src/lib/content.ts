import "server-only";
import { unstable_cache } from "next/cache";
import { defaultContent, type SiteContent } from "@/data/content";
import { readContent } from "./db";

export const CONTENT_TAG = "site-content";

// Fill any missing top-level sections from the seed, so an older saved
// document keeps working if the schema gains fields later.
function withDefaults(stored: SiteContent): SiteContent {
  return {
    ...defaultContent,
    ...stored,
    profile: { ...defaultContent.profile, ...stored.profile },
    contact: {
      emailjs: { ...defaultContent.contact.emailjs, ...stored.contact?.emailjs },
    },
  };
}

async function load(): Promise<SiteContent> {
  try {
    const stored = await readContent();
    return stored ? withDefaults(stored) : defaultContent;
  } catch {
    // No database configured yet (e.g. local dev) → serve the seed.
    return defaultContent;
  }
}

// Cached across requests; the admin save calls revalidateTag(CONTENT_TAG).
export const getContent = unstable_cache(load, ["site-content-loader"], {
  tags: [CONTENT_TAG],
});
