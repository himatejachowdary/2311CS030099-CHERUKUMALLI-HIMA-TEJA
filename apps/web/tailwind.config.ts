import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0f172a',
        panel: '#111827',
        accent: '#14b8a6',
        accentSoft: '#99f6e4',
        warning: '#f59e0b',
        danger: '#ef4444',
        success: '#22c55e'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 20px 60px rgba(20, 184, 166, 0.14)'
      }
    }
  },
  plugins: []
} satisfies Config;
