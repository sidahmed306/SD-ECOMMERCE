/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#FFF8F0',
          100: '#FFF0DC',
          200: '#FFD9A8',
          300: '#FFB870',
          400: '#FF9940',
          500: '#FF6B00',
          600: '#E05A00',
          700: '#B84A00',
          800: '#8F3900',
          900: '#6B2B00',
        },
      },
    },
  },
  plugins: [],
}
