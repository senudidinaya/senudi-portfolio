import { z } from "zod";
import type { SiteContent } from "@/data/content";

const skillGroup = z.object({
  label: z.string(),
  items: z.array(z.string()),
});

const project = z.object({
  title: z.string(),
  kind: z.string(),
  timeframe: z.string(),
  summary: z.string(),
  highlights: z.array(z.string()),
  stack: z.array(z.string()),
  metric: z.object({ value: z.string(), label: z.string() }).optional(),
  link: z.object({ href: z.string(), label: z.string() }).optional(),
});

export const siteContentSchema = z.object({
  profile: z.object({
    name: z.string(),
    roles: z.array(z.string()),
    headline: z.string(),
    openTo: z.string(),
    location: z.string(),
    email: z.string(),
    phone: z.string(),
    linkedin: z.string(),
    github: z.string(),
    resumeFile: z.string(),
    theBridge: z.object({ ask: z.string(), build: z.string() }),
    tagline: z.string(),
  }),
  metrics: z.array(z.object({ value: z.string(), label: z.string() })),
  about: z.object({ paragraphs: z.array(z.string()) }),
  skills: z.object({
    business: skillGroup,
    technical: skillGroup,
    shared: skillGroup,
  }),
  projects: z.array(project),
  publication: z.object({
    title: z.string(),
    role: z.string(),
    venue: z.string(),
    date: z.string(),
    doi: z.string(),
    doiUrl: z.string(),
  }),
  education: z.array(
    z.object({
      school: z.string(),
      credential: z.string(),
      timeframe: z.string(),
    })
  ),
  additional: z.object({
    languages: z.array(z.string()),
    activities: z.array(z.string()),
  }),
  contact: z.object({
    emailjs: z.object({
      serviceId: z.string(),
      templateId: z.string(),
      publicKey: z.string(),
    }),
  }),
}) satisfies z.ZodType<SiteContent>;
