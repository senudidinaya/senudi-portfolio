import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Projects } from "@/components/Projects";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { getContent } from "@/lib/content";

// Saving in the admin revalidates instantly; this is a periodic backstop.
export const revalidate = 300;

export default async function Home() {
  const c = await getContent();
  return (
    <>
      <Nav profile={c.profile} />
      <main>
        <Hero profile={c.profile} metrics={c.metrics} />
        <About about={c.about} education={c.education} additional={c.additional} />
        <Skills skills={c.skills} />
        <Projects projects={c.projects} publication={c.publication} />
        <Contact profile={c.profile} emailjs={c.contact.emailjs} />
      </main>
      <Footer profile={c.profile} />
    </>
  );
}
