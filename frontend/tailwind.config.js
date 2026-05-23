/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        flipBlue: '#2874F0',
        flipBlueDark: '#1c5fc9',
        flipYellow: '#FF9F00',
        flipOrange: '#FB641E',
        flipGreen: '#388E3C',
        flipBg: '#F1F3F6',
        flipText: '#212121',
        flipMuted: '#878787',
        flipBorder: '#E0E0E0',
      },
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0,0,0,0.06)',
        header: '0 2px 4px 0 rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
