import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "!./src/app/api/**",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0ecfb",
          100: "#ddd5f5",
          200: "#b9a8eb",
          500: "#5442a8",
          600: "#3B2D8E",
          700: "#2e2370",
          900: "#1a1447",
        },
        accent: {
          50: "#f0fce8",
          100: "#d9f5c4",
          500: "#6DC944",
          600: "#5ab536",
          700: "#479128",
        },
        surface: {
          0: "#ffffff",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
    },
  },
  plugins: [],
}

export default config
