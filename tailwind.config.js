/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./**/*.{ts,tsx}"],
  darkMode: "media",
  plugins: [require("@tailwindcss/forms")]
}
