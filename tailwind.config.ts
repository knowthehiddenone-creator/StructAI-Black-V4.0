import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Engineering Design System
        eng: {
          blue: "#0969DA",
          "blue-hover": "#0860CA",
          "blue-subtle": "#DDF4FF",
          "blue-border": "#54AEFF",
          purple: "#7C3AED",
          "purple-subtle": "#F3EEFF",
          canvas: "#F6F8FA",
          surface: "#FFFFFF",
          "surface-2": "#F6F8FA",
          "surface-3": "#EAEEF2",
          border: "#D0D7DE",
          "border-muted": "#E8EFF5",
          "text-primary": "#1F2328",
          "text-secondary": "#656D76",
          "text-muted": "#8C959F",
          success: "#1A7F37",
          "success-subtle": "#DAFBE1",
          "success-border": "#4AC26B",
          warning: "#9A6700",
          "warning-subtle": "#FFF8C5",
          "warning-border": "#D4A72C",
          danger: "#CF222E",
          "danger-subtle": "#FFEBE9",
          "danger-border": "#FF8182",
          "code-bg": "#161B22",
          "code-text": "#E6EDF3",
          sidebar: "#0D1117",
          "sidebar-hover": "#1C2128",
          "sidebar-active": "#0969DA",
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "draw-line": {
          from: { strokeDashoffset: "1000" },
          to: { strokeDashoffset: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "progress-fill": {
          from: { width: "0%" },
          to: { width: "var(--progress-width)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "fade-in-slow": "fade-in 0.6s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "spin-slow": "spin-slow 12s linear infinite",
      },
      boxShadow: {
        "eng-card": "0 1px 3px rgba(31,35,40,0.08), 0 0 0 1px rgba(208,215,222,0.5)",
        "eng-card-hover": "0 4px 12px rgba(31,35,40,0.12), 0 0 0 1px rgba(208,215,222,0.5)",
        "eng-input": "0 0 0 1px #D0D7DE",
        "eng-input-focus": "0 0 0 3px rgba(9,105,218,0.25), 0 0 0 1px #0969DA",
        "eng-blue": "0 4px 16px rgba(9,105,218,0.2)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
