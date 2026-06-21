/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A5F',
          50: '#E8EEF5',
          100: '#C5D4E6',
          200: '#8FA9CC',
          300: '#5A7EB3',
          400: '#3A5E8A',
          500: '#1E3A5F',
          600: '#17304F',
          700: '#10253D',
          800: '#0A1A2C',
          900: '#050F1A',
        },
        brand: {
          emerald: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      borderRadius: {
        card: '8px',
      },
    },
  },
  plugins: [],
};
