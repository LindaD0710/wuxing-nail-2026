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
        /* 香槟珍珠静奢风主色 */
        mystic: {
          deep: "#4a3a2a",       // 深咖 / 炭灰棕
          mid: "#725b3b",        // 中深香槟金
          soft: "#9b7a4a",       // 柔和金棕
          light: "#cfb48a",      // 浅香槟金
          lavender: "#e8d7b5",   // 珍珠暖光
          gloss: "#f4e7cf",      // 珍珠光泽
          shimmer: "#f8f1e3",    // 香槟雾光
          cream: "#fbf6ee",      // 奶油米白
        },
        morandi: {
          cream: "#f8f3ea",
          stone: "#e7dfd2",
          sage: "#c1b39a",
          dust: "#b19d86",
          mist: "#d6c8b0",
          blush: "#e5d4bc",
          clay: "#8a6f4b",
        },
        ice: {
          blue: "#f2eee6",
          mint: "#ebe6dc",
          lavender: "#f5eee2",
          peach: "#f8f0e4",
        },
        pearl: {
          DEFAULT: "#f8f3ea",
          light: "#fcf8f0",
          pink: "#f2e6dd",
          lavender: "#efe4d6",
        },
        aurora: {
          mint: "#f0e8da",
          blue: "#f4ecde",
          violet: "#f6efe2",
        },
      },
      fontFamily: {
        // 全局无衬线正文：Noto Sans SC 为中文主字体，Inter / 系统为西文兜底
        sans: [
          "var(--font-noto-sans-sc)",
          "Inter",
          "PingFang SC",
          "Microsoft YaHei",
          "system-ui",
          "sans-serif",
        ],
        // 全局衬线：优先思源宋体，再退到系统中文与衬线
        serif: [
          "var(--font-noto-serif-sc)",
          "PingFang SC",
          "Microsoft YaHei",
          "Georgia",
          "serif",
        ],
        // 标题辅助：Playfair Display，用于英文字母/数字装饰
        title: [
          "var(--font-playfair)",
          "var(--font-noto-serif-sc)",
          "PingFang SC",
          "Microsoft YaHei",
          "Georgia",
          "serif",
        ],
        // Label：Montserrat，用于英文/拉丁小标签
        label: [
          "var(--font-montserrat)",
          "Inter",
          "PingFang SC",
          "Microsoft YaHei",
          "system-ui",
          "sans-serif",
        ],
        // 年份数字：Georgia，经典衬线、系统内置
        year: [
          "Georgia",
          "var(--font-adobe-garamond)",
          "var(--font-eb-garamond)",
          "serif",
        ],
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
