/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'custom-lg': '1040px',
      ...require('tailwindcss/defaultTheme').screens,
    },
    extend: {
      colors: {
        primary: {
          50: '#fef3e2',
          100: '#fde7c5',
          200: '#fbcf8b',
          300: '#f9b751',
          400: '#f79f17',
          500: '#d68508',
          600: '#a66a06',
          700: '#764f04',
          800: '#463302',
          900: '#161801',
        },
        secondary: {
          50: '#f5f3f0',
          100: '#ebe7e1',
          200: '#d7cfc3',
          300: '#c3b7a5',
          400: '#af9f87',
          500: '#9b8769',
          600: '#7c6c54',
          700: '#5d513f',
          800: '#3e362a',
          900: '#1f1b15',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
