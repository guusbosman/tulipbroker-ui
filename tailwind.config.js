/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0d223f",
          800: "#13335a",
          700: "#1c4a78",
        },
        cream: "#f6f1e4",
        tulip: {
          red: "#ff6b6b",
          pink: "#ff8c8c",
          green: "#5bc489",
        },
        accent: {
          yellow: "#f7c66a",
          teal: "#3fb7c2",
        },
        slate: {
          950: "#0a172a",
          700: "#42526b",
          500: "#8a9bb5",
        },
      },
      fontFamily: {
        display: ["\"DM Sans\"", "sans-serif"],
        body: ["\"Work Sans\"", "sans-serif"],
      },
      boxShadow: {
        frame: "0 12px 24px rgba(6, 21, 37, 0.3)",
        card: "0 8px 16px rgba(9, 30, 66, 0.18)",
      },
      borderRadius: {
        frame: "32px",
        panel: "24px",
      },
    },
  },
  plugins: [],
}
