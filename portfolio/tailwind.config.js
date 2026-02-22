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
          purple: '#8B5CF6',
          violet: '#A78BFA',
          pink: '#EC4899',
          cyan: '#06B6D4',
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
          accent: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-purple': 'radial-gradient(at 40% 20%, hsla(263,80%,60%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(280,70%,50%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(220,70%,60%,0.1) 0px, transparent 50%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-sm': '0 0 10px rgba(139, 92, 246, 0.2)',
        'panel': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
