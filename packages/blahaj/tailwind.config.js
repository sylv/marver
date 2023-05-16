/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.tsx'],
  theme: {
    // fontFamily: {
    //   sans: ['Poppins', 'sans-serif'],
    // },
    extend: {
      colors: {
        brand: '#a78bfa',
        body: '#141414',
        gray: {
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        dark: {
          100: '#121212',
          200: '#1d1d1d',
          300: '#212121',
          400: '#242424',
          500: '#272727',
          600: '#2c2c2c',
          700: '#2d2d2d',
          800: '#333333',
          900: '#353535',
          999: '#373737',
        },
      },
    },
  },
  plugins: [],
};
