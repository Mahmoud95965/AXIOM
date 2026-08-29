import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-main)",
        foreground: "var(--text-primary)",
        surface: {
          1: "var(--bg-surface-1)",
          2: "var(--bg-surface-2)",
          3: "var(--bg-surface-3)",
          elevated: "var(--bg-surface-elevated)",
        },
        gemini: {
          blue: "#4285F4",
          lightBlue: "#a8c7fa",
          purple: "#9B51E0",
          lightPurple: "#c58af9",
          coral: "#EA4335",
          pink: "#f8a8d4",
          amber: "#FBBC05",
        }
      },
      fontFamily: {
        arabic: ['var(--font-cairo)', 'sans-serif'],
        latin: ['var(--font-google-sans)', 'sans-serif'],
        mono: ['var(--font-fira-code)', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 0 35px rgba(66, 133, 244, 0.25)',
        'glow-purple': '0 0 35px rgba(155, 81, 224, 0.3)',
      }
    },
  },
  plugins: [],
};
export default config;
