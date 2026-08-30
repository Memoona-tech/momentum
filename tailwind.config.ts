import type { Config } from "tailwindcss";

// "Vault" theme — matte black, brass gold, deep emerald. A quiet, dial-and-hairline
// luxury language rather than glossy gradients: flat surfaces, 1px borders, restrained motion.
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        void: {
          950: "#0a0a0b",
          900: "#111113",
          800: "#17171a",
          700: "#1f1f23",
          600: "#2a2a2e",
          400: "#8f8b84",
          200: "#d8d3c8",
        },
        parchment: "#ece7dd",
        gold: {
          200: "#e7d5a4",
          400: "#c9a44c",
          500: "#b8923c",
          600: "#9a7830",
        },
        emerald: {
          400: "#3f8a73",
          500: "#2f6f5e",
          600: "#265a4c",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        vault: "0 1px 0 0 rgba(201,164,76,0.08) inset, 0 12px 32px -16px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        grain: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)",
      },
      backgroundSize: {
        grain: "3px 3px",
      },
    },
  },
  plugins: [],
};
export default config;
