/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js}"],
  theme: {
    extend: {
      colors: {
        // Deep archive green: the "ready" and primary-action colour.
        brand: {
          50: "#eef7f4",
          100: "#d5ece5",
          200: "#abd8cb",
          300: "#77bca9",
          400: "#469c87",
          500: "#2a806c",
          600: "#1f6857",
          700: "#1b5447",
          800: "#18443a",
          900: "#143830",
        },
        // Sealing-wax red: anything that is still locked.
        seal: {
          50: "#fdf3f0",
          100: "#fbe3dc",
          200: "#f5c4b6",
          300: "#ec9a83",
          400: "#df6a4d",
          500: "#c94a2c",
          600: "#ab3920",
          700: "#8d2e1c",
          800: "#75291c",
          900: "#62261b",
        },
        paper: "#f6f1e8",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
