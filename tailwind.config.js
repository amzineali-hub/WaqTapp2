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
          primary: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
            950: '#042f2e',
          },
          accent: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
            950: '#451a03',
          },
          // Majorelle Blue — accent secondaire discret (jardin Majorelle, Marrakech)
          majorelle: {
            50: '#f3f1fe',
            100: '#e9e5fd',
            200: '#d6cdfb',
            300: '#b7a8f6',
            400: '#9478ef',
            500: '#6050dc',
            600: '#4f3cc4',
            700: '#412fa0',
            800: '#362880',
            900: '#2d2268',
            950: '#1c1542',
          },
        }
      },
      keyframes: {
        'press-in': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(2px)' },
        },
      },
    },
  },
  plugins: [],
}
