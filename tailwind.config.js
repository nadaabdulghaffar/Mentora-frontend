/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        primary: "#7163ba",
        "primary-dark": "#5f53a3",
        slateInk: "#2c3e50",
      },
    },
  },
  plugins: [],
}

