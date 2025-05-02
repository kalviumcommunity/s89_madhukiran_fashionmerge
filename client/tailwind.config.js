/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        gold: {
          50: '#fdf9e8',
          100: '#fbf3d1',
          200: '#f7e7a3',
          300: '#f3db75',
          400: '#efcf47',
          500: '#ebc319',
          600: '#bc9c14',
          700: '#8d750f',
          800: '#5e4e0a',
          900: '#2f2705',
        },
      },
    },
  },
  plugins: [],
};