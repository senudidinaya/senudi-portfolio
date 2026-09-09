import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        surface2: "rgb(var(--surface-2) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        warm: "rgb(var(--warm) / <alpha-value>)",
        cool: "rgb(var(--cool) / <alpha-value>)",
        bridge: "rgb(var(--bridge) / <alpha-value>)",
      },
      fontFamily: {
        serif: ["var(--font-newsreader)", "Georgia", "serif"],
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 8vw, 7.5rem)", { lineHeight: "0.95" }],
        "display-lg": ["clamp(2.25rem, 5.5vw, 4.5rem)", { lineHeight: "1.02" }],
      },
      letterSpacing: {
        display: "-0.02em",
      },
      maxWidth: {
        content: "68rem",
      },
      // One radius for every card-shaped box on the public site, and a
      // tighter one for the chips that sit inside them, so the whole set
      // stays in step from a single place. Full-bleed bands (the skills
      // strip, the marquee) and the hairline rows keep square corners —
      // their edges run off the viewport, so a radius has nothing to sit on.
      borderRadius: {
        card: "0.75rem",
        chip: "0.5rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "draw-line": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        // one damped rotation burst — hover-only, so it settles back to rest
        // rather than looping at the reader
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "22%": { transform: "rotate(-1.4deg)" },
          "44%": { transform: "rotate(1.1deg)" },
          "66%": { transform: "rotate(-0.7deg)" },
          "84%": { transform: "rotate(0.35deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "draw-line": "draw-line 1s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both",
        wiggle: "wiggle 0.65s cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
