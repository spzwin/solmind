import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        solana: {
          purple: "#9945FF",
          green: "#14F195",
          dark: "#0E0E1A",
          card: "#1A1A2E",
          border: "#2A2A3E",
        },
      },
    },
  },
  plugins: [],
};

export default config;
