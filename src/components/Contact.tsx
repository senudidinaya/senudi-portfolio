"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import type { Profile, SiteContent } from "@/data/content";
import { SectionHeading } from "./SectionHeading";
import { MotionReveal } from "./motion/MotionReveal";
import { Magnetic } from "./motion/Magnetic";

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
    <section id="contact" className="border-t border-line bg-bg px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-content">
        <SectionHeading eyebrow="04 / Contact" title="Let's talk" />

        {/* closing statement — brand line, same register as the hero sentence */}
        <div className="mt-12 font-serif text-display-xl font-light uppercase tracking-display text-ink">
          <StatementLine delay={0}>Let&rsquo;s build</StatementLine>
          <StatementLine delay={0.14}>
            the <em className="lowercase text-bridge">bridge</em>.
          </StatementLine>
        </div>

        <div className="mt-16 grid gap-14 sm:mt-20 lg:grid-cols-[1fr_1.1fr]">
          <MotionReveal className="space-y-10">
            <p className="max-w-md font-serif text-xl font-light leading-relaxed text-ink sm:text-2xl">
              Looking for someone who can read the business need and build the
              solution? I'd love to hear what you're working on.
            </p>

            <a
              href={`mailto:${profile.email}`}
              className="group relative inline-block max-w-full break-words pb-2 font-serif text-2xl font-light text-ink sm:text-3xl xl:text-4xl"
            >
              {profile.email}
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-line" />
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-ink transition-transform duration-500 group-hover:scale-x-100"
              />
            </a>

            <ul className="space-y-4">
              <ContactLink label="LinkedIn" value="in/senudi-rupasinghe" href={profile.linkedin} />
              <ContactLink label="GitHub" value="senudidinaya" href={profile.github} />
              <ContactLink label="Location" value={profile.location} />
            </ul>
          </MotionReveal>

          <MotionReveal delay={0.12}>
            <div className="border-t border-line pt-8 lg:border-0 lg:pt-0">
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
            </div>
          </MotionReveal>
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
