"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import type { Profile, SiteContent } from "@/data/content";
import { MotionReveal } from "./motion/MotionReveal";
import { Magnetic } from "./motion/Magnetic";
import { BaseMap } from "./contact/BaseMap";

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
    // muted/60 not --line: the input rule is a meaningful boundary (WCAG 1.4.11),
    // decorative hairlines elsewhere keep --line
    "w-full rounded-none border-0 border-b border-muted/60 bg-transparent px-0 py-3 text-sm text-ink placeholder:text-muted/60 transition-colors focus:border-ink focus:outline-none focus:ring-0";

  return (
    <section
      id="contact"
      className="relative w-full overflow-clip plate-dark bg-bg min-h-[100svh]"
    >
      {/* sticky full-viewport globe — stays pinned while the content below
          scrolls over it; overflow-clip on the section (not overflow-hidden)
          keeps this element's own scroll container from being hijacked */}
      <div className="sticky top-0 h-[100svh]" aria-hidden="true">
        <BaseMap />
      </div>

      <div className="relative z-10 -mt-[100svh]">
        {/* vertical chapter marker — the izanami "COMPANY" gesture */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-5 top-1/2 hidden -translate-y-1/2 font-mono text-xs uppercase tracking-[0.3em] text-muted [writing-mode:vertical-rl] lg:block sm:left-8"
        >
          04 &mdash; CONTACT
        </span>

        {/* accessible heading; the display statement below carries the visual weight */}
        <h2 className="sr-only">Contact</h2>

        <div className="mx-auto max-w-content px-5 py-20 sm:px-8 sm:py-28">
          <div className="relative">
            {/* legibility scrim behind the left column's body-size copy */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-6 -inset-y-10 bg-gradient-to-r from-bg/70 to-transparent sm:-inset-x-10 lg:w-[65%]"
            />

            <div className="grid gap-x-16 gap-y-14 lg:grid-cols-[1fr_minmax(0,26rem)]">
              {/* closing statement + intro copy */}
              <MotionReveal className="relative space-y-10">
                <div className="font-serif text-display-xl font-light uppercase tracking-display text-ink">
                  <StatementLine delay={0}>Let&rsquo;s build</StatementLine>
                  <StatementLine delay={0.14}>
                    the <em className="lowercase text-bridge">bridge</em>.
                  </StatementLine>
                </div>

                <p className="max-w-md font-serif text-xl font-light leading-relaxed text-ink sm:text-2xl">
                  Looking for someone who can read the business need and build the
                  solution? I'd love to hear what you're working on.
                </p>
              </MotionReveal>

              {/* form + contact links, panel-treated at lg+ only */}
              <MotionReveal
                delay={0.12}
                className="relative bg-bg/85 p-6 sm:p-8 lg:border lg:border-line lg:bg-bg/60 lg:p-8 lg:backdrop-blur-[2px]"
              >
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

                      <Magnetic>
                        <button
                          type="submit"
                          disabled={status === "sending"}
                          className="terminal-card px-8 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-surface disabled:opacity-60"
                        >
                          {status === "sending"
                            ? "Sending…"
                            : configured
                            ? "Send message"
                            : "Compose email"}
                        </button>
                      </Magnetic>
                    </form>
                  </>
                )}

                <ul className="mt-10 space-y-4 border-t border-line pt-8">
                  <ContactLink
                    label="Email"
                    value={profile.email}
                    href={`mailto:${profile.email}`}
                  />
                  <ContactLink label="LinkedIn" value="in/senudi-rupasinghe" href={profile.linkedin} />
                  <ContactLink label="GitHub" value="senudidinaya" href={profile.github} />
                  <ContactLink label="Location" value={profile.location} />
                </ul>
              </MotionReveal>
            </div>
          </div>
        </div>

        {/* HUD captions — the plate's signature, anchored to the scene's corners.
            Stacked below sm: side by side (bottom-left/right) at sm+ the combined
            text can exceed a phone's width and the two would overlap each other. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-6 z-10 mx-auto flex max-w-content flex-col items-start gap-2 px-5 sm:flex-row sm:items-end sm:justify-between sm:px-8"
        >
          <span className="bg-bg/85 px-2.5 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink">
            FIG. 05 &mdash; BASE OF OPERATIONS
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink/70 sm:text-right">
            {profile.location} &middot; 07.03&deg; N / 79.92&deg; E &middot; UTC+05:30
          </span>
        </div>
      </div>
    </section>
  );
}

function StatementLine({
  delay,
  children,
}: {
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.span
      className="block overflow-hidden pb-[0.09em] -mb-[0.09em]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
    >
      <motion.span
        className="block"
        variants={{
          hidden: { y: "112%" },
          visible: {
            y: "0%",
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay },
          },
        }}
      >
        {children}
      </motion.span>
    </motion.span>
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
