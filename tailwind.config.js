/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#05070A',
        cyan: {
          neon: '#00E5FF',
          soft: '#22D3EE',
          dim: '#0891B2',
        },
        silver: '#CBD5E1',
        ice: '#F0F9FF',
      },
      fontFamily: {
        display: ['"Bangers"', 'cursive'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 8px #00E5FF, 0 0 20px #00E5FF44',
        'neon-lg': '0 0 15px #00E5FF, 0 0 40px #00E5FF66',
        'neon-sm': '0 0 4px #00E5FF, 0 0 10px #00E5FF33',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'fog': 'fog 8s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 8px #00E5FF, 0 0 20px #00E5FF44' },
          '50%': { boxShadow: '0 0 15px #00E5FF, 0 0 40px #00E5FF88' },
        },
        'fog': {
          '0%': { opacity: '0.3', transform: 'translateX(-5px)' },
          '100%': { opacity: '0.6', transform: 'translateX(5px)' },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
