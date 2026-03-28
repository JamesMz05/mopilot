/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('./shared-ui/tailwind.preset.js')],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './shared-ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors – keep for backward compat during transition
        mopilot: { 50: '#f0f4ff', 100: '#dbe4ff', 500: '#3b5bdb', 600: '#364fc7', 700: '#2b44a8' },
      },
    },
  },
  plugins: [],
}
