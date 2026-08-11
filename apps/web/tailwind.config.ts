import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#000000",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f7f7f5",
          foreground: "#000000",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#f7f7f5",
          foreground: "#666666",
        },
        accent: {
          DEFAULT: "#f7f7f5",
          foreground: "#000000",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // DESIGN.md tokens
        hairline: "#e6e6e6",
        'hairline-soft': "#f1f1f1",
        canvas: "#ffffff",
        'canvas-soft': "#f6f5f4",
        surface: "#ffffff",
        'surface-soft': "#f7f7f5",
        ink: "#000000",
        'ink-secondary': "#31302e",
        'ink-muted': "#615d59",
        'ink-faint': "#a39e98",
        'primary-active': "#005bab",
        'on-primary': "#ffffff",
        'accent-sky': "#62aef0",
        'accent-purple': "#d6b6f6",
        'accent-purple-deep': "#391c57",
        'accent-pink': "#ff64c8",
        'accent-orange': "#dd5b00",
        'accent-teal': "#2a9d99",
        'accent-green': "#1aae39",
        'block-lime': "#dceeb1",
        'block-lilac': "#c5b0f4",
        'block-cream': "#f4ecd6",
        'block-pink': "#efd4d4",
        'block-mint': "#c8e6cd",
        'block-coral': "#f3c9b6",
        'block-navy': "#1f1d3d",
        'accent-magenta': "#ff3d8b",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "14px",
        '2xl': "14px",
        '3xl': "14px",
        pill: "9999px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
