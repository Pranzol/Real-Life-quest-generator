/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rpg: {
          bg: '#0a051b',
          card: 'rgba(20, 12, 45, 0.6)',
          border: 'rgba(139, 92, 246, 0.2)',
          borderHover: 'rgba(139, 92, 246, 0.5)',
          purple: {
            light: '#a78bfa',
            DEFAULT: '#8b5cf6',
            dark: '#6d28d9',
            glow: '#c084fc',
          },
          blue: {
            light: '#60a5fa',
            DEFAULT: '#3b82f6',
            dark: '#1d4ed8',
            glow: '#93c5fd',
          },
          gold: {
            light: '#fbbf24',
            DEFAULT: '#f59e0b',
            dark: '#b45309',
            glow: '#fde047',
          },
          success: '#10b981',
          danger: '#ef4444',
        }
      },
      boxShadow: {
        'purple-glow': '0 0 15px rgba(139, 92, 246, 0.4)',
        'blue-glow': '0 0 15px rgba(59, 82, 246, 0.4)',
        'gold-glow': '0 0 15px rgba(245, 158, 11, 0.4)',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
