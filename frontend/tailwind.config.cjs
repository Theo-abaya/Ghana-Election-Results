/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        npp: "#0000FF", // Blue
        ndc: "#008000", // Green
        electionRed: "#FF0000",
      },
    },
  },
  plugins: [],
};
