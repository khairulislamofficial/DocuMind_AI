/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#09090b", // Deep slate black
        surface: "#18181b", // Sleek dark surface card
        brand: {
          light: "#818cf8",
          DEFAULT: "#6366f1", // Main Indigo-500
          dark: "#4f46e5"
        }
      }
    }
  },
  plugins: []
};
