import type { Profile } from "@/data/content";
import { Magnetic } from "./motion/Magnetic";

export function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="overflow-hidden border-t border-line px-5 pb-8 pt-14 sm:px-8 sm:pt-16">
      <div className="mx-auto max-w-content">
        <p
          aria-hidden="true"
          className="select-none font-serif text-display-lg font-light uppercase leading-none tracking-display text-ink opacity-10"
        >
          {profile.name}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-line pt-6">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            © {new Date().getFullYear()} {profile.name} &middot; {profile.location}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.14em]">
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="text-muted transition-colors hover:text-ink"
            >
              LinkedIn
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="text-muted transition-colors hover:text-ink"
            >
              GitHub
            </a>
            <a
              href={profile.resumeFile}
              download
              className="text-muted transition-colors hover:text-ink"
            >
              Resume
            </a>
            <Magnetic>
              <a href="#top" className="text-ink">
                Back to top {"↑"}
              </a>
            </Magnetic>
          </div>
        </div>

        <p className="marker mt-12 text-center">+++ END +++</p>
      </div>
    </footer>
  );
}
