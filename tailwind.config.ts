import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: "#fdfcfa",
          100: "#faf7f2",
          200: "#f3ede3",
          300: "#e8dfd0",
        },
        ink: {
          DEFAULT: "#211d1a",
          soft: "#4a443e",
          faint: "#8a827a",
        },
        burgundy: {
          DEFAULT: "#6b1f2e",
          dark: "#521722",
          light: "#8a2b3d",
        },
        brass: {
          DEFAULT: "#a3762a",
          light: "#c29645",
          pale: "#f0e6d2",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        wider2: "0.18em",
      },
      aspectRatio: {
        "3/4": "3 / 4",
      },
    },
  },
  plugins: [],
};

export default config;
