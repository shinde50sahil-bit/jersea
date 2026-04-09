import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./utils/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        jersea: {
          bg: "#0A0A0A",
          surface: "#131313",
          surfaceSoft: "#1A1A1A",
          neonBlue: "#21D4FD",
          volt: "#B7FF00",
          pink: "#FF3CAC",
          muted: "#A1A1AA"
        }
      },
      boxShadow: {
        neon:
          "0 0 14px rgba(33, 212, 253, 0.38), 0 0 34px rgba(33, 212, 253, 0.2)",
        "neon-strong":
          "0 0 18px rgba(183, 255, 0, 0.42), 0 0 42px rgba(183, 255, 0, 0.24)"
      }
    }
  },
  plugins: []
};

export default config;
