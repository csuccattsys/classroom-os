/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- Crucial: This scans all sub-folders inside src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
