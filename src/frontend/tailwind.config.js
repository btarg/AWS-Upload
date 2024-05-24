/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class', // This enables dark mode
  theme: {
    extend: {
      colors: {
        'light': {
          'background': '#f6f2ff', // light gray for background
          'primary': '#1f2937', // dark gray for primary text
          'secondary': '#4F46E5', // indigo for secondary text
          'muted': 'dimgray', // gray for muted text
          'buttonPrimary': '#4F46E5', // indigo for primary button
          'buttonSecondary': '#F3F4F6', // very light gray for secondary button
          'buttonTextPrimary': '#ffffff', // white for primary button text
          'buttonTextSecondary': 'rgb(129 140 248 / var(--tw-text-opacity))', // indigo for secondary button text
        },
        'dark': {
          'background': '#0d091d', // dark blue for background
          'primary': 'whitesmoke', // white for primary text
          'secondary': '#4F46E5', // indigo for secondary text
          'muted': 'whitesmoke', // gray for muted text
          'buttonPrimary': '#4F46E5', // indigo for primary button
          'buttonSecondary': '#1f2937', // dark gray for secondary button
          'buttonTextPrimary': '#ffffff', // white for primary button text
          'buttonTextSecondary': '#1f2937', // dark gray for secondary button text
        }
      }
    },
  },
  plugins: [],
}