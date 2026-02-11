import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* 神秘紫主色 + 光泽感 */
        mystic: {
          deep: "#2d1b4e",
          mid: "#4a3a6b",
          soft: "#6b5b8a",
          light: "#9d8bb8",
          lavender: "#b8a9d4",
          gloss: "#d4c8e8",
          shimmer: "#ebe4f5",
          cream: "#f3eff8",
        },
        morandi: {
          cream: "#f5f0f8",
          stone: "#e8e4f0",
          sage: "#9d8bb8",
          dust: "#b8a9c4",
          mist: "#a89bc4",
          blush: "#c4b5d4",
          clay: "#7b6b9e",
        },
        ice: {
          blue: "#e8e4f5",
          mint: "#e0e4f0",
          lavender: "#ebe4f8",
          peach: "#f0e8f5",
        },
        pearl: {
          DEFAULT: "#f5f0f8",
          light: "#faf8fc",
          pink: "#efe8f2",
          lavender: "#ebe4f5",
        },
        aurora: {
          mint: "#e4e0f0",
          blue: "#e8e4f5",
          violet: "#efe8f5",
        },
      },
      fontFamily: {
        sans: ["var(--font-noto-sans-sc)", "system-ui", "sans-serif"],
        serif: ["var(--font-noto-serif-sc)", "Georgia", "serif"],
      },
      animation: {
        "shimmer": "shimmer 8s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-2px) scale(1.01)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(45,27,78,0.08), 0 0 0 1px rgba(212,200,232,0.5) inset",
        "glass-glow": "0 0 48px rgba(157,139,184,0.25), 0 0 0 1px rgba(255,255,255,0.4) inset",
        "glass-glow-purple": "0 0 56px rgba(123,107,158,0.2), 0 8px 32px rgba(45,27,78,0.06)",
        "input-emboss": "inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 1px rgba(0,0,0,0.04)",
        "btn-glow": "0 0 28px rgba(157,139,184,0.5), 0 0 48px rgba(212,200,232,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
