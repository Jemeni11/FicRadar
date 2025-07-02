/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        "fr-1": "#4143C7",
        "fr-2": "#141142",
        "fr-3": "#121217",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
}
