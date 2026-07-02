import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        v4: {
          red: "#e50914",
          "red-dark": "#b20710",
          "red-darker": "#80050b",
          "red-deepest": "#400306",
          green: "#52cc5a",
          gold: "#ffc02a",
          black: "#000000",
          "near-black": "#1a1a1a",
          charcoal: "#333333",
          "dark-gray": "#262626",
          gray: "#b3b3b3",
          "gray-medium": "#cccccc",
          "gray-light": "#e5e5e5",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 20px 60px -15px rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
