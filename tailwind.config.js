/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  safelist: [
    { pattern: /^from-/ },
    { pattern: /^to-/ },
    { pattern: /^bg-gradient-to-/ },
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          bg:       '#080B14',
          surface:  '#0E1421',
          elevated: '#141B2D',
          border:   '#1E2D45',
          muted:    '#2A3A55',
        },
        accent: {
          blue:   '#3B82F6',
          violet: '#7C3AED',
          cyan:   '#06B6D4',
          glow:   '#60A5FA',
        },
        'text-primary':   '#F0F4FF',
        'text-secondary': '#94A3B8',
        'text-muted':     '#4A5568',
        difficulty: {
          easy:   '#10B981',
          medium: '#F59E0B',
          hard:   '#EF4444',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        heading: ['Rajdhani', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-blue':   '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-violet': '0 0 20px rgba(124, 58, 237, 0.4)',
        'glow-card':   '0 8px 32px rgba(0, 0, 0, 0.6)',
        'glow-sm':     '0 0 10px rgba(59, 130, 246, 0.25)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        heroGlow: {
          '0%, 100%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)' },
          '50%':      { boxShadow: '0 0 70px rgba(124, 58, 237, 0.5)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
      animation: {
        shimmer:      'shimmer 2s linear infinite',
        fadeIn:       'fadeIn 0.3s ease-out',
        scaleIn:      'scaleIn 0.2s ease-out',
        'hero-glow':  'heroGlow 4s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 2s ease-in-out infinite',
      },
      screens: { xs: '480px' },
    },
  },
  plugins: [],
}
