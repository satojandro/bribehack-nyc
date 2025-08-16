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
        background: "#0a0a0a",
        "gray-dark": "#1a1a1a",
        "gray-medium": "#2a2a2a",
        "gray-light": "#555555",
        primary: "#9f7aea", // Electric Purple
        secondary: "#4cff91", // Neon Green
        accent: "#f472b6", // Hot Pink for accents
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["Roboto Mono", "monospace"],
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(159, 122, 234, 0.5)',
        'glow-secondary': '0 0 15px rgba(76, 255, 145, 0.5)',
      }
    },
  },
  plugins: [],
};
export default config;