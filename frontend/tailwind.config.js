/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      colors: {
        primary: "#003461",
        "primary-container": "#004b87",
        secondary: "#016b54",
        "secondary-container": "#9bf0d3",
        tertiary: "#003c25",
        error: "#ba1a1a",
        background: "#f9f9fd",
        "on-surface": "#191c1e",
        "on-surface-variant": "#424750",
        "surface-container-low": "#f3f3f7",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#e7e8eb",
        "outline-variant": "#c2c6d1",
      },
    },
  },
  plugins: [],
}
