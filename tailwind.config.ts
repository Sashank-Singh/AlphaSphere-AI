import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./index.html",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#30363d",
        input: "#0d1117",
        ring: "#238636",
        background: "#0d1117",
        foreground: "#c9d1d9",
        primary: {
          DEFAULT: "#238636",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#8b949e",
          foreground: "#c9d1d9",
        },
        destructive: {
          DEFAULT: "#f85149",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#30363d",
          foreground: "#8b949e",
        },
        accent: {
          DEFAULT: "#21262d",
          foreground: "#c9d1d9",
        },
        popover: {
          DEFAULT: "#161b22",
          foreground: "#c9d1d9",
        },
        card: {
          DEFAULT: "#161b22",
          foreground: "#c9d1d9",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;