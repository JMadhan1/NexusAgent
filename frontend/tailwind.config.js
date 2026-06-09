/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#0a0a0f',
          900: '#1a1a2e',
          800: '#2d2d44',
          700: '#404055',
          600: '#5a5a7a',
          500: '#7a7a9e',
          400: '#9a9abe',
          300: '#bababd',
          200: '#d0d0d8',
          100: '#e8e8f0',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        }
      }
    }
  },
  plugins: [],
}
