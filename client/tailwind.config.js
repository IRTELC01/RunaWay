/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#ff3cac',
          blue: '#784ba0',
          cyan: '#2b86c5',
          green: '#39ff14',
          yellow: '#faff00',
        },
      },
      boxShadow: {
        glow: '0 0 24px rgba(57,255,20,0.45), 0 0 18px rgba(43,134,197,0.5), inset 0 0 12px rgba(255,60,172,0.45)'
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)'
      }
    },
  },
  plugins: [],
}