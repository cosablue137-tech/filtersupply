import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1a1a1a",
        paper: "#faf9f7",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Hiragino Kaku Gothic ProN", "Meiryo", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
