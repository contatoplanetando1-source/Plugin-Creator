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
          base: "#000000",
          surface: "#1a1a1a",
          raised: "#262626",
          border: "#333333",
        },
        accent: {
          DEFAULT: "#e50914",
          hover: "#b20710",
          dark: "#80050b",
        },
        success: "#52cc5a",
        danger: "#e50914",
        text: {
          primary: "#ffffff",
          muted: "#b3b3b3",
        },
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
