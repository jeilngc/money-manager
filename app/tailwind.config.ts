import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0B1425",
        foreground: "#F8FAFF",
        muted: "#182744",
        mutedForeground: "#8FA4C7",
        accent: "#B6F542",
        accentForeground: "#0B1425",
        border: "#203253",
        input: "#14223C",
        card: "#142342",
        cardForeground: "#F8FAFF",
        ring: "#B6F542",
      },
      fontFamily: {
        sans: ["var(--font-inter-tight)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-inter-tight)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Fira Code", "monospace"],
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
        "5xl": "3.5rem",
        "6xl": "4.5rem",
        "7xl": "6rem",
        "8xl": "8rem",
        "9xl": "10rem",
      },
      letterSpacing: {
        tighter: "-0.06em",
        tight: "-0.04em",
        normal: "-0.01em",
        wide: "0.05em",
        wider: "0.1em",
        widest: "0.2em",
      },
      lineHeight: {
        none: "1",
        tight: "1.1",
        snug: "1.25",
        normal: "1.6",
        relaxed: "1.75",
      },
      borderRadius: {
        none: "0px",
        DEFAULT: "1rem",
      },
      borderWidth: {
        DEFAULT: "1px",
        thick: "2px",
      },
      transitionTimingFunction: {
        crisp: "cubic-bezier(0.25, 0, 0, 1)",
      },
      transitionDuration: {
        150: "150ms",
        200: "200ms",
        500: "500ms",
      },
      maxWidth: {
        container: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
