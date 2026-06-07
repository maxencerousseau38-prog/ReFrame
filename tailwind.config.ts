import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep, premium "Bloomberg-after-dark" palette
        ink: {
          950: "#050608",
          900: "#0a0c10",
          850: "#0e1117",
          800: "#13161d",
          700: "#1a1e27",
          600: "#232834",
          500: "#2e3442",
        },
        mist: {
          50: "#f7f8fa",
          100: "#eceef2",
          200: "#d6dae2",
          300: "#aab2c2",
          400: "#7c869a",
          500: "#5a6478",
        },
        accent: {
          // Subtle electric blue — the single brand accent
          DEFAULT: "#5b8cff",
          soft: "#7ba2ff",
          deep: "#3d6fe0",
          glow: "rgba(91, 140, 255, 0.35)",
        },
        // Semantic finance colors
        bull: "#2fd180",
        bear: "#ff5d6c",
        gold: "#e9c46a",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        elev: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 60px -20px rgba(0,0,0,0.7)",
        glow: "0 0 0 1px rgba(91,140,255,0.18), 0 18px 50px -12px rgba(91,140,255,0.32)",
        card: "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 12px 40px -18px rgba(0,0,0,0.65)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)",
        "radial-accent":
          "radial-gradient(60% 60% at 50% 0%, rgba(91,140,255,0.16) 0%, transparent 70%)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        ticker: "ticker 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
