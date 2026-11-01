/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          ink: 'var(--accent-ink)',
        },
        good: {
          DEFAULT: 'var(--good)',
          bg: 'var(--good-bg)',
          line: 'var(--good-line)',
        },
        okay: {
          DEFAULT: 'var(--okay)',
          bg: 'var(--okay-bg)',
          line: 'var(--okay-line)',
        },
        weak: {
          DEFAULT: 'var(--weak)',
          bg: 'var(--weak-bg)',
          line: 'var(--weak-line)',
        },
        // Legacy fallback aliases mapping strictly to warm tokens
        brand: {
          dark: 'var(--paper)',
          charcoal: 'var(--surface)',
          surface: 'var(--surface)',
          card: 'var(--surface)',
          border: 'var(--line)',
          lime: 'var(--accent)',
          cyan: 'var(--muted)',
          emerald: 'var(--good)',
          amber: 'var(--okay)',
          rose: 'var(--weak)',
          purple: 'var(--muted)',
        }
      },
      fontFamily: {
        headline: ['Fraunces', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Devanagari"', '"Noto Sans Telugu"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'scale-14': ['14px', { lineHeight: '1.6' }],
        'scale-16': ['16px', { lineHeight: '1.6' }],
        'scale-20': ['20px', { lineHeight: '1.5' }],
        'scale-28': ['28px', { lineHeight: '1.3' }],
        'scale-40': ['40px', { lineHeight: '1.2' }],
      },
      borderRadius: {
        btn: '12px',
        card: '16px',
      },
      borderWidth: {
        1: '1px',
      },
      maxWidth: {
        content: '720px',
      },
      minHeight: {
        touch: '48px',
      },
      minWidth: {
        touch: '48px',
      },
      animation: {
        'pulse-functional': 'pulseRecord 200ms ease-in-out',
        'fade-in': 'fadeIn 180ms ease-out forwards',
        'fill-bar': 'fillBar 220ms ease-out forwards',
      },
      keyframes: {
        pulseRecord: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fillBar: {
          '0%': { width: '0%' },
        }
      }
    },
  },
  plugins: [],
}
