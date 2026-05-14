/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef9ff',
          100: '#d9f1ff',
          200: '#bce8ff',
          300: '#8edaff',
          400: '#59c3ff',
          500: '#33a5ff',
          600: '#1b86f5',
          700: '#146ee1',
          800: '#1759b6',
          900: '#194c8f',
        },
        success: { 400: '#4ade80', 500: '#22c55e' },
        danger: { 400: '#f87171', 500: '#ef4444' },
        warning: { 400: '#fbbf24', 500: '#f59e0b' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
