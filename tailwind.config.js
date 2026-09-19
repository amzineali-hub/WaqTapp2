/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        waqt: {
          primary: '#0D9488', // Teal/emerald Moroccan primary
          dark: '#0F766E',
          light: '#F0FDFA',
          accent: '#F59E0B', // Moroccan amber
          green: '#10B981',
        }
      }
    },
  },
  plugins: [],
}
