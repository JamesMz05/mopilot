/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('./shared-ui/tailwind.preset.js')],
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './shared-ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        zeo: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#00a651',
          700: '#15803d',
          800: '#006b33',
          900: '#14532d',
        },
      },
    },
  },
  plugins: [],
}
