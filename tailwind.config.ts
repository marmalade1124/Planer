
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#171717",
        "bg-white": "#FFFFFF",
        "primary-dark": "#1A1A1A",
        "secondary-gray": "#71717A",
        "border-subtle": "#F1F1F1",
        
        // Sage (High Energy)
        "sage-light": "#F2F6F2",
        "sage-border": "#DCE6DC",
        "sage-text": "#4A5D4A",
        
        // Blue (Low Energy)
        "blue-light": "#F0F4F8",
        "blue-border": "#D9E2EC",
        "blue-text": "#506680",
        
        // Amber (Medium Energy)
        "amber-light": "#FEF9EC",
        "amber-border": "#F9F0D5",
        "amber-text": "#856404"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-jakarta)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
