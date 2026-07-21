import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SecretEntry } from "@/components/SecretEntry";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { IntroProvider } from "@/components/motion/Preloader";
import { getContent } from "@/lib/content";
import "./globals.css";

// Monochrome film-grain texture, encoded once at module load and tiled as a
// background-image so the overlay below needs no client JS.
const GRAIN_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg'><filter id='grain'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch' result='noise'/><feColorMatrix in='noise' type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#grain)'/></svg>";
const GRAIN_DATA_URI = `data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}`;

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
        <ThemeProvider>
          <IntroProvider>
            <SmoothScroll>{children}</SmoothScroll>
          </IntroProvider>
        </ThemeProvider>
        <SecretEntry />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.03]"
          style={{
            backgroundImage: `url("${GRAIN_DATA_URI}")`,
            backgroundRepeat: "repeat",
            backgroundSize: "180px 180px",
          }}
        />
      </body>
    </html>
  );
}
