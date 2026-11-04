/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32',
          light: '#60AD5E',
          dark: '#005005',
        },
        accent: {
          DEFAULT: '#F57F17',
          light: '#FFAD42',
          dark: '#BC5100',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'Inter', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
