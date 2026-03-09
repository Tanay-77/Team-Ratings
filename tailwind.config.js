/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#f97316', // tailwind orange-500
        'brand-orange-hover': '#ea580c', // tailwind orange-600
        'brand-gray': '#f9fafb', // light gray for backgrounds
      }
    },
  },
  plugins: [],
};
