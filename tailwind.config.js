/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#080B11',
          surface: '#0B0F19',
          elevated: '#121826',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-strong': '#1E293B',
        },
        text: {
          primary: '#F5F7FA',
          secondary: '#9AA4B2',
          muted: '#64748B',
        },
        lime: {
          DEFAULT: '#C5F36B',
          hover: '#D2F68A',
          active: '#B8E85E',
          glow: 'rgba(197, 243, 107, 0.25)',
        },
        brand: {
          dark: '#080B11',
          charcoal: '#0B0F19',
          surface: '#121826',
          card: '#161F32',
          border: 'rgba(255, 255, 255, 0.08)',
          lime: '#C5F36B',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          purple: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
