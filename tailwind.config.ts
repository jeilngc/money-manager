import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Earth-drawn palette: forest floor, clay, unbleached paper
        background: "#FDFCF8",
        foreground: "#2C2C24",
        primary: "#5D7052",
        primaryForeground: "#F3F4F1",
        secondary: "#C18C5D",
        secondaryForeground: "#FFFFFF",
        accent: "#E6DCCD",
        accentForeground: "#4A4A40",
        muted: "#F0EBE5",
        mutedForeground: "#78786C",
        border: "#DED8CF",
        input: "#FFFFFF",
        card: "#FEFEFA",
        cardForeground: "#2C2C24",
        destructive: "#A85448",
        destructiveForeground: "#FDFCF8",
        ring: "#5D7052",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "Nunito", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
        serif: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.953rem",
        "4xl": "2.441rem",
        "5xl": "3.052rem",
        "6xl": "3.815rem",
        "7xl": "4.768rem",
      },
      letterSpacing: {
        tighter: "-0.03em",
        tight: "-0.015em",
        normal: "-0.005em",
        wide: "0.02em",
        wider: "0.04em",
      },
      lineHeight: {
        none: "1",
        tight: "1.15",
        snug: "1.3",
        normal: "1.65",
        relaxed: "1.8",
      },
      borderRadius: {
        none: "0px",
        DEFAULT: "1.25rem",
        blob: "60% 40% 30% 70% / 60% 30% 70% 40%",
      },
      borderWidth: {
        DEFAULT: "1px",
        thick: "2px",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(93, 112, 82, 0.15)",
        float: "0 10px 40px -10px rgba(193, 140, 93, 0.2)",
        lift: "0 20px 40px -10px rgba(93, 112, 82, 0.18)",
      },
      transitionTimingFunction: {
        crisp: "cubic-bezier(0.25, 0, 0, 1)",
      },
      transitionDuration: {
        150: "150ms",
        300: "300ms",
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
