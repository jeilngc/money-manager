import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Each token reads a "R G B" triple from a CSS variable so Tailwind's
        // opacity modifiers (bg-primary/10 etc.) keep working in both themes.
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        primaryForeground: "rgb(var(--primary-foreground) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        secondaryForeground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        accentForeground: "rgb(var(--accent-foreground) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        mutedForeground: "rgb(var(--muted-foreground) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        cardForeground: "rgb(var(--card-foreground) / <alpha-value>)",
        destructive: "rgb(var(--destructive) / <alpha-value>)",
        destructiveForeground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
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
