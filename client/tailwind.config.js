/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        appleBlue: "#0A84FF",
        applePurple: "#5E5CE6",
        appleGreen: "#30D158",
        appleBackground: "#F5F5F7",
        appleDarkBg: "#1C1C1E",
        appleCard: "#FFFFFF",
        appleDarkCard: "#2C2C2E"
      },
      borderRadius: {
        'apple': '12px',
        'apple-lg': '16px'
      }
    },
  },
  plugins: [],
}
