/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#09090b",      // Deep Dark Background (Zinc 950)
        surface: "#18181b",   // Surface color (Zinc 900)
        action: "#10b981",    // Emerald 500 for primary actions
        actionHover: "#059669",
        danger: "#ef4444",    // Red 500
        warning: "#f59e0b",   // Amber 500
        success: "#10b981",   // Emerald 500
        canvas: "#000000",    // True black canvas
        muted: "#d4d4d8",     // Zinc 300 — slightly brighter for readability on dark backgrounds
      },
      fontFamily: {
        display: ["'Outfit'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}