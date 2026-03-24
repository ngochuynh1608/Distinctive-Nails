/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        cream: "#FBF8F3",
        sand: "#E8E0D5",
        gold: "#B8860B",
        rose: "#C9A9A6",
        charcoal: "#2C2826",
        warm: "#5C534E",
      },
    },
  },
  plugins: [],
};
