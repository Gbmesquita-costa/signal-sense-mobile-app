/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Background
        background: {
          DEFAULT: "#FFFFFF",
          dark: "#0B0E11",
        },
        // Surface (cards, modals)
        surface: {
          DEFAULT: "#F3F4F6",
          dark: "#12161C",
        },
        // Primary (blue confidence)
        primary: {
          DEFAULT: "#3B82F6",
          dark: "#3B82F6",
        },
        // Accent
        accent: {
          DEFAULT: "#0EA5E9",
          dark: "#22D3EE",
        },
        // Success
        success: {
          DEFAULT: "#16A34A",
          dark: "#22C55E",
        },
        // Warning
        warning: {
          DEFAULT: "#CA8A04",
          dark: "#FACC15",
        },
        // Error
        error: {
          DEFAULT: "#DC2626",
          dark: "#EF4444",
        },
        // Text
        "text-primary": {
          DEFAULT: "#111827",
          dark: "#E5E7EB",
        },
        "text-secondary": {
          DEFAULT: "#6B7280",
          dark: "#9CA3AF",
        },
        "text-tertiary": {
          DEFAULT: "#9CA3AF",
          dark: "#6B7280",
        },
        // Border
        border: {
          DEFAULT: "#E5E7EB",
          dark: "#1F2937",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
