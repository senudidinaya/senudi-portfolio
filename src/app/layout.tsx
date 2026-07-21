import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SecretEntry } from "@/components/SecretEntry";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { IntroProvider, Preloader } from "@/components/motion/Preloader";
import { CursorRing } from "@/components/motion/CursorRing";

// runs before first paint so repeat visits (and the admin) never flash the intro
const introSkip =
  'try{if(location.pathname.indexOf("/admin")===0||sessionStorage.getItem("senudi_intro_seen")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.setAttribute("data-intro-done","")}catch(e){}';
import { getContent } from "@/lib/content";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getContent();
  return {
    title: `${profile.name} \u2014 ${profile.headline}`,
    description: profile.tagline,
    openGraph: {
      title: `${profile.name} \u2014 ${profile.headline}`,
      description: profile.tagline,
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: introSkip }} />
        <ThemeProvider>
          <IntroProvider>
            <SmoothScroll>{children}</SmoothScroll>
            <Preloader />
          </IntroProvider>
        </ThemeProvider>
        <SecretEntry />
        <CursorRing />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
