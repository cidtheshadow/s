/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F5132',
          light: '#198754',
          dark: '#0A3622',
          50: '#E8F5E9'
        },
        surface: '#F8F9FA',
        card: '#FFFFFF',
        amber: {
          DEFAULT: '#D97706',
          light: '#FEF3C7'
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2'
        },
        accent: '#2563EB'
      }
    },
  },
  plugins: [],
};
