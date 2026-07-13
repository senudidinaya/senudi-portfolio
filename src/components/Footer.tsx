import type { Profile } from "@/data/content";

export function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-4 border-t border-line pt-8 sm:flex-row">
        <p className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} {profile.name}
        </p>
        <div className="flex items-center gap-5">
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted transition-colors hover:text-ink"
          >
            LinkedIn
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted transition-colors hover:text-ink"
          >
            GitHub
          </a>
          <a
            href={profile.resumeFile}
            download
            className="text-xs text-muted transition-colors hover:text-ink"
          >
            Resume
          </a>
        </div>
      </div>
    </footer>
  );
}
