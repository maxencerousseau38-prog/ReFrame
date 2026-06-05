import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm near-black — primary text & primary actions.
        ink: {
          DEFAULT: "#16140f",
          soft: "#2b2823",
        },
        // Warm off-white page background.
        paper: "#f5f3ee",
        // Warm gray for secondary text.
        muted: "#6f6b62",
        line: "rgba(22, 20, 15, 0.10)",
        // Beige grisé (greige) — the warm neutral that carries the brand.
        beige: {
          light: "#ece9e1",
          DEFAULT: "#ddd7c9",
          dark: "#c4bdab",
        },
        // "accent" stays as a token name but resolves to ink, so the palette
        // remains strictly noir / blanc / beige grisé.
        accent: {
          DEFAULT: "#16140f",
          soft: "#3a362e",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      boxShadow: {
        glass:
          "0 1px 1px rgba(0,0,0,0.02), 0 8px 24px -8px rgba(10,10,40,0.12), 0 24px 64px -24px rgba(10,10,40,0.18)",
        card: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -16px rgba(10,10,40,0.12)",
      },
      animation: {
        "blob-slow": "blob 18s ease-in-out infinite",
      },
      keyframes: {
        blob: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(3%, -4%) scale(1.06)" },
          "66%": { transform: "translate(-3%, 3%) scale(0.96)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
