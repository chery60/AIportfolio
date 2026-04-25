/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#FFFFFF',
          grid: '#F3F4F6',
        },
        panel: {
          bg: '#FFFFFF',
          border: '#E5E7EB',
          hover: '#F9FAFB',
          active: '#F3F4F6',
        },
        accent: {
          purple: '#5e6ad2',
          violet: '#7170ff',
          pink: '#828fff',
          cyan: '#7170ff',
          amber: '#F59E0B',
        },
        surface: {
          0: '#FFFFFF',
          1: '#F9FAFB',
          2: '#F3F4F6',
          3: '#E5E7EB',
          4: '#D1D5DB',
        },
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          muted: '#9CA3AF',
          accent: '#5e6ad2',
        },
        brand: {
          DEFAULT: '#5e6ad2',
          accent: '#7170ff',
          hover: '#828fff',
        },
        dark: {
          bg: '#08090a',
          panel: '#0f1011',
          surface: '#191a1b',
          elevated: '#28282c',
        },
        'dark-text': {
          primary: '#f7f8f8',
          secondary: '#d0d6e0',
          tertiary: '#8a8f98',
          quaternary: '#62666d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'grid': 'grid 15s linear infinite',
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
        "shimmer-slide": "shimmer-slide var(--speed) ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        grid: {
          "0%": { transform: "translateY(-50%)" },
          "100%": { transform: "translateY(0)" },
        },
        "spin-around": {
          "0%": {
            transform: "translateZ(0) rotate(0)",
          },
          "15%, 35%": {
            transform: "translateZ(0) rotate(90deg)",
          },
          "65%, 85%": {
            transform: "translateZ(0) rotate(270deg)",
          },
          "100%": {
            transform: "translateZ(0) rotate(360deg)",
          },
        },
        "shimmer-slide": {
          to: {
            transform: "translate(calc(100cqw - 100%), 0)",
          },
        },
      },
      boxShadow: {
        'glow-brand': '0 0 20px rgba(94, 106, 210, 0.2)',
        'glow-sm': '0 0 10px rgba(94, 106, 210, 0.15)',
        'panel': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'ring': 'rgba(0,0,0,0.2) 0px 0px 0px 1px',
        'elevated': 'rgba(0,0,0,0.4) 0px 2px 4px',
      }
    },
  },
  plugins: [],
}
