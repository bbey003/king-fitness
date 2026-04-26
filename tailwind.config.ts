import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#dde6ff',
          200: '#bccdff',
          300: '#8aa6ff',
          400: '#5478ff',
          500: '#1f51e5',
          600: '#1a44c4',
          700: '#16399f',
          800: '#201b7e',
          900: '#1a166a',
          950: '#0f0d44',
        },
        ink: {
          50: '#f5f7fb',
          100: '#e9edf5',
          900: '#0a0d1a',
          950: '#05070f',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'mesh-grad':
          'radial-gradient(ellipse 80% 50% at 20% 0%, rgba(31,81,229,0.35), transparent 60%), radial-gradient(ellipse 60% 60% at 80% 100%, rgba(32,27,126,0.45), transparent 60%), radial-gradient(ellipse 70% 50% at 50% 50%, rgba(31,81,229,0.18), transparent 70%)',
        'glow-grad':
          'linear-gradient(135deg, #1f51e5 0%, #201b7e 100%)',
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(31, 81, 229, 0.55)',
        'glow-lg': '0 0 60px -10px rgba(31, 81, 229, 0.7)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(31, 81, 229, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(31, 81, 229, 0.8)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
