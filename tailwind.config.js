/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soft-bg': '#FDFBF9',
        'sage': '#A8D5BA',
      },
    },
  },
  plugins: [],
}