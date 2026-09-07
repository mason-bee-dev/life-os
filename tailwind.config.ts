import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        sidebar: "var(--sidebar)",
        track: "var(--track)",
        faint: "var(--faint)",
        "border-hover": "var(--border-hover)",
        "metric-sleep": "var(--metric-sleep)",
        "metric-productivity": "var(--metric-productivity)",
        "metric-mood": "var(--metric-mood)",
        "metric-water": "var(--metric-water)",
        "priority-low": "var(--priority-low)",
        "score-good": "var(--score-good)",
        "login-orb": "var(--login-orb)",
        toast: "var(--toast)",
        "icon-muted": "var(--icon-muted)",
        "primary-muted": "var(--primary-muted)",
        "metric-mood-muted": "var(--metric-mood-muted)",
        "metric-productivity-muted": "var(--metric-productivity-muted)",
        "metric-water-soft": "var(--metric-water-soft)",
        "metric-productivity-soft": "var(--metric-productivity-soft)",
        "icon-muted-soft": "var(--icon-muted-soft)",
        "chart-cursor": "var(--chart-cursor)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
      },
      fontFamily: {
        sans: [
          "Be Vietnam Pro",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        // Restored to pre-refactor inventory sizes (see font-size audit table)
        caption: ["12.5px", { lineHeight: "1.4", fontWeight: "400" }],
        body: ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        label: ["13.5px", { lineHeight: "1.4", fontWeight: "500" }],
        heading: ["15px", { lineHeight: "1.3", fontWeight: "600" }],
        stat: ["26px", { lineHeight: "1.2", fontWeight: "600" }],
        title: ["26px", { lineHeight: "1.2", fontWeight: "600" }],
        display: ["30px", { lineHeight: "1.1", fontWeight: "700" }],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
