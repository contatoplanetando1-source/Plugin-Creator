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
        bg: {
          base: "#0a0a0a",
          surface: "#141414",
          raised: "#1a1a1a",
          border: "#2a2a2a",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
        },
        success: "#22c55e",
        danger: "#ef4444",
        text: {
          primary: "#f5f5f5",
          muted: "#a3a3a3",
        },
      },
    },
  },
  plugins: [],
};

export default config;
