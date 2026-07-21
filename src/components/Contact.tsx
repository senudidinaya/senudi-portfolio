"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import type { Profile, SiteContent } from "@/data/content";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

type Status = "idle" | "sending" | "sent" | "error";

export function Contact({
  profile,
  emailjs: cfg,
}: {
  profile: Profile;
  emailjs: SiteContent["contact"]["emailjs"];
}) {
  const [status, setStatus] = useState<Status>("idle");
  const configured =
    !!cfg.serviceId &&
    !!cfg.templateId &&
    !!cfg.publicKey &&
    cfg.serviceId !== "YOUR_SERVICE_ID" &&
    cfg.templateId !== "YOUR_TEMPLATE_ID" &&
    cfg.publicKey !== "YOUR_PUBLIC_KEY";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    // Not configured yet → fall back to the visitor's mail client.
    if (!configured) {
      const data = new FormData(form);
      const subject = encodeURIComponent(`Portfolio message from ${data.get("name")}`);
      const body = encodeURIComponent(
        `${data.get("message")}\n\nFrom: ${data.get("name")} (${data.get("email")})`
      );
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
      return;
    }

    setStatus("sending");
    try {
      await emailjs.sendForm(cfg.serviceId, cfg.templateId, form, {
        publicKey: cfg.publicKey,
      });
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-cool focus:outline-none";

  return (
    <section id="contact" className="border-t border-line bg-bg px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-content">
        <SectionHeading eyebrow="04 / Contact" title="Let's talk" />

        <div className="mt-12 grid gap-14 lg:grid-cols-[1fr_1.1fr]">
          <Reveal className="space-y-8">
            <p className="max-w-md font-serif text-xl font-light leading-relaxed text-ink sm:text-2xl">
              Looking for someone who can read the business need and build the
              solution? I'd love to hear what you're working on.
            </p>

            <ul className="space-y-4">
              <ContactLink label="Email" value={profile.email} href={`mailto:${profile.email}`} />
              <ContactLink label="LinkedIn" value="in/senudi-rupasinghe" href={profile.linkedin} />
              <ContactLink label="GitHub" value="senudidinaya" href={profile.github} />
              <ContactLink label="Location" value={profile.location} />
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-lg shadow-ink/5 sm:p-8">
              {status === "sent" ? (
                <div className="grid min-h-[18rem] place-items-center text-center">
                  <div>
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-line text-bridge">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                        aria-hidden="true"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                    <p className="mt-4 font-serif text-2xl font-light text-ink">
                      Message sent.
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      Thanks for reaching out — I'll get back to you soon.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-serif text-xl font-light tracking-tight text-ink sm:text-2xl">
                    Send a message
                  </h3>
                  <p className="mt-1.5 text-sm text-muted">
                    A line about the role or project — I'll reply to your email.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="eyebrow">Name</span>
                        <input
                          name="name"
                          type="text"
                          required
                          autoComplete="name"
                          placeholder="Your name"
                          className={`mt-2 ${fieldClass}`}
                        />
                      </label>
                      <label className="block">
                        <span className="eyebrow">Email</span>
                        <input
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="you@company.com"
                          className={`mt-2 ${fieldClass}`}
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="eyebrow">Message</span>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        placeholder="A line about the role or project…"
                        className={`mt-2 resize-none ${fieldClass}`}
                      />
                    </label>

                    {status === "error" && (
                      <p className="text-sm text-warm">
                        Something went wrong sending that. Email me directly at{" "}
                        {profile.email}.
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="w-full rounded-xl bg-ink px-6 py-3.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {status === "sending"
                        ? "Sending…"
                        : configured
                        ? "Send message"
                        : "Compose email"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ContactLink({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      <span className="text-sm text-ink">{value}</span>
    </>
  );
  return (
    <li>
      {href ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noreferrer" : undefined}
          className="flex items-center justify-between border-b border-line py-3 transition-colors hover:text-cool"
        >
          {content}
          <span className="text-muted">&rarr;</span>
        </a>
      ) : (
        <div className="flex items-center justify-between border-b border-line py-3">
          {content}
        </div>
      )}
    </li>
  );
}
