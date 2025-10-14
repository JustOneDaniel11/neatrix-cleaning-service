/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './admin.html',
    './index.html',
    './src/**/*.{ts,tsx,js,jsx,html}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('tailwindcss-animate')],
};