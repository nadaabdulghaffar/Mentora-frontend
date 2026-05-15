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
        primary: "#6C5CE7",
        "primary-dark": "#5b4bd6",
        slateInk: "#1f2937",
        accent: "#8bd3d6",
        pane: "#f6f7fb",
        card: "#ffffff",
        muted: "#6b7280",
      },
    },
  },
  plugins: [],
}

