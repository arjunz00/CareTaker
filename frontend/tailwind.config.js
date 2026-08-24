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
          50: '#f5f7fa',
          100: '#e4e8f0',
          200: '#c8d1e3',
          300: '#a2b3d1',
          400: '#758ebd',
          500: '#536fa6',
          600: '#415689',
          700: '#34456e',
          800: '#2e3a5a',
          900: '#29324c',
          950: '#030712', /* Sleek Slate 950 */
        }
      }
    },
  },
  plugins: [],
}
