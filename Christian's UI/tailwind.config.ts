import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./styles/**/*.{ts,tsx}",
    "./styles/**/*.{css}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fdf8ed",
          100: "#f9efd5",
          200: "#f2dba9",
          300: "#ebc77d",
          400: "#e4b351",
          500: "#cf9330",
          600: "#a17120",
          700: "#735015",
        },
        buff: {
          50: "#fdf8ed",
          100: "#f9efd5",
          200: "#f2dba9",
          300: "#ebc77d",
          400: "#e4b351",
          500: "#d99a1f",
          600: "#b07918",
          700: "#875912",
          800: "#5e3a0b",
          900: "#352206"
        },
        onyx: {
          50: "#f4f4f4",
          100: "#dcdcdc",
          500: "#2b2b2b",
          600: "#1f1f1f",
          700: "#141414",
          900: "#050505"
        },
        success: "#21ba45",
        warning: "#f9a825",
        danger: "#d32f2f"
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["'Space Grotesk'", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
