/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  darkMode: 'class',

  presets: [require('nativewind/preset')],

  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },

    extend: {
      colors: {
        brand: {
          300: '#E8BCF0',
          400: '#DA8EE7',
          500: '#CA5CDD',
          600: '#BE2ED6',
          700: '#B100CD',
          800: '#A000C8',
          900: '#8A00C2',
        },

        night: {
          50: '#FAF9FC',
          100: '#F2F0FA',
          500: '#777486',
          700: '#4B4858',
          900: '#201E2E',
          950: '#17152B',
        },

        gold: {
          500: '#FFD700',
        },

        lavender: {
          50: '#FAF9FC',
          100: '#F2F0FA',
          200: '#E5E1EE',
        },

        danger: '#ff0000',
      },

      borderRadius: {
        card: '12px',
        control: '10px',
      },

      boxShadow: {
        soft: '0 2px 8px rgba(112, 87, 217, 0.08)',
      },

      fontFamily: {
        sans: ['Inter', 'System'],
      },
    },
  },

  plugins: [],
};