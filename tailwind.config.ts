import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  safelist: [
    // Muted, sophisticated color palette
    'bg-gradient-to-br', 'shadow-sm',
    // Stone & neutral tones (muted beige/cream)
    'from-stone-100', 'to-neutral-100', 'text-stone-700', 'border-stone-300',
    'from-neutral-100', 'to-stone-100', 'text-neutral-700', 'border-neutral-300',
    // Warm amber/peach tones
    'from-amber-50', 'to-orange-50', 'text-amber-800', 'border-amber-200',
    // Slate & gray (cool and muted)
    'from-slate-100', 'to-gray-100', 'text-slate-700', 'border-slate-300',
    'from-gray-100', 'to-slate-100', 'text-gray-600', 'border-gray-200',
    // Sky blue (muted)
    'from-sky-50', 'to-blue-50', 'text-sky-700', 'border-sky-200',
    // Rose/pink (muted)
    'from-rose-50', 'to-pink-50', 'text-rose-700', 'border-rose-200',
    // Cyan/teal (muted)
    'from-cyan-50', 'to-teal-50', 'text-cyan-700', 'border-cyan-200',
    // Zinc
    'from-zinc-100', 'to-slate-100', 'text-zinc-700', 'border-zinc-300',
    // Emerald/teal (muted)
    'from-emerald-50', 'to-teal-50', 'text-emerald-700', 'border-emerald-200',
    // Sage AI tab gradient
    'bg-gradient-to-r', 'from-green-50', 'to-emerald-50', 'text-green-700', 'border-green-200',
    // Sage AI button gradient
    'from-green-600', 'to-emerald-600', 'hover:from-green-700', 'hover:to-emerald-700',
  ],
  theme: {
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("daisyui"), require("tailwindcss-animate")],
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
}

export default config

