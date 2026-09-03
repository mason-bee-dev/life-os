import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic tokens (shadcn-compatible names, hardcoded dark palette)
        background: "#070c16",
        foreground: "#e8edf5",
        border: "#1c2740",
        input: "#1c2740",
        ring: "#10b981",
        sidebar: "#05080f",
        track: "#1e293b",
        faint: "#5c6b85",
        card: {
          DEFAULT: "#0f1626",
          foreground: "#e8edf5",
        },
        primary: {
          DEFAULT: "#10b981",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#131d31",
          foreground: "#93a1b8",
        },
        accent: {
          DEFAULT: "#182137",
          foreground: "#e8edf5",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
