import type { Metadata } from "next";
import { isAuthed } from "@/lib/session";
import { getContent } from "@/lib/content";
import { LoginForm } from "./LoginForm";
import { AdminEditor } from "./AdminEditor";

export const dynamic = "force-dynamic";

// Keep the admin panel out of search engines.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const configured =
    !!process.env.ADMIN_PASSWORD_HASH &&
    (process.env.SESSION_SECRET?.length ?? 0) >= 32;

  if (!configured) {
    return (
      <main className="mx-auto grid min-h-screen max-w-lg place-items-center px-6">
        <div className="rounded-2xl border border-line bg-surface p-8">
          <h1 className="font-serif text-2xl font-light text-ink">
            Admin not configured
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Set <code className="text-ink">ADMIN_PASSWORD_HASH</code> and a 32+
            character <code className="text-ink">SESSION_SECRET</code> in your
            environment, then reload. See{" "}
            <code className="text-ink">ADMIN_SETUP.md</code>.
          </p>
        </div>
      </main>
    );
  }

  if (!(await isAuthed())) {
    return <LoginForm />;
  }

  const content = await getContent();
  return <AdminEditor initial={content} />;
}
