import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "fly-across": {
          "0%": {
            transform: "translate(-100%, -50%) rotate(0deg)",
            opacity: "0",
          },
          "10%": {
            opacity: "1",
          },
          "90%": {
            opacity: "1",
          },
          "100%": {
            transform: "translate(200%, -50%) rotate(360deg)",
            opacity: "0",
          },
        },
      },
      animation: {
        "fly-across": "fly-across 2s ease-in-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
