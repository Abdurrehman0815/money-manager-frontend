/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10B981', // The Lovable Green (Emerald-500)
        secondary: '#34D399', // A lighter green for accents
        danger: '#EF4444',  // Red for Expenses
        dark: '#1F2937',    // Dark text
        light: '#F3F4F6',   // Background gray
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Clean font
      }
    },
  },
  plugins: [],
}