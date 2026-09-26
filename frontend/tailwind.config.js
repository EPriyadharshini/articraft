/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#f7f1ea',
        clay: '#c06d4d',
        forest: '#1f3a34',
        gold: '#d4ad6a',
        charcoal: '#171717',
      },
      boxShadow: {
        soft: '0 20px 60px rgba(30, 40, 27, 0.10)',
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
