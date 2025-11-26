/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          amber: '#f59e0b',
          background: '#0f1115',
          surface: '#14171c',
          surfaceAlt: '#0f131a'
        }
      }
    },
  },
  plugins: [],
}
