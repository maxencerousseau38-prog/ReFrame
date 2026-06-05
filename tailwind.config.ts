import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0a0b",
          soft: "#1c1c20",
        },
        paper: "#fbfbfd",
        muted: "#71717a",
        line: "rgba(10, 10, 15, 0.08)",
        accent: {
          DEFAULT: "#4f46e5",
          soft: "#6366f1",
          cyan: "#06b6d4",
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
