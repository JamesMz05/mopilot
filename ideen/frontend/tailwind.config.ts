import type { Config } from "tailwindcss";

const config: Config = {
  presets: [require('./shared-ui/tailwind.preset.js')],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./shared-ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors – keep for backward compat during transition
        mopilot: {
          green: "#2D6A4F",
          "green-light": "#40916C",
          "green-dark": "#1B4332",
        },
      },
    },
  },
  plugins: [],
};

export default config;
