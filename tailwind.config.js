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
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "ping-slow": "ping 4s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        "ping-slow": {
          "0%": { transform: "scale(0.5)", opacity: "0.7" },
          "70%": { transform: "scale(2)", opacity: "0.3" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
}
