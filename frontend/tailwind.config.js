/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mopilot: { 50: '#f0f4ff', 100: '#dbe4ff', 500: '#3b5bdb', 600: '#364fc7', 700: '#2b44a8' },
      },
    },
  },
  plugins: [],
}
