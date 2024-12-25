import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        morado: "#D076E6",
        crema: "#E8E8E8",
        ligero: "#E3DADA",
        cielo: "#4888BC",
        oscuro: "#58789A",
      },
      zIndex: {
        200: "200",
      },
    },
  },
  plugins: [],
} satisfies Config;
