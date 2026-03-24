import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

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
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // ─── Font Families ───────────────────────────────────────────────────
      fontFamily: {
        // Body / UI chrome — Plus Jakarta Sans: humanist, legible, warm
        sans: ['"Plus Jakarta Sans"', "system-ui", "ui-sans-serif", "sans-serif"],
        // Display / Headings — Space Grotesk: geometric, distinct brand voice
        display: ['"Space Grotesk"', "system-ui", "ui-sans-serif", "sans-serif"],
        // Monospace — JetBrains Mono: for data, analytics, IDs, timestamps
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },

      // ─── Font Sizes (with default line-height + letter-spacing) ──────────
      fontSize: {
        // Base scale — line heights tuned for screen reading
        xs:   ["0.75rem",   { lineHeight: "1rem",     letterSpacing: "0.025em"  }],
        sm:   ["0.875rem",  { lineHeight: "1.25rem",  letterSpacing: "0"        }],
        base: ["1rem",      { lineHeight: "1.625rem", letterSpacing: "0"        }],
        lg:   ["1.125rem",  { lineHeight: "1.75rem",  letterSpacing: "-0.01em"  }],
        xl:   ["1.25rem",   { lineHeight: "1.75rem",  letterSpacing: "-0.01em"  }],
        "2xl":["1.5rem",    { lineHeight: "2rem",     letterSpacing: "-0.02em"  }],
        "3xl":["1.875rem",  { lineHeight: "2.25rem",  letterSpacing: "-0.025em" }],
        "4xl":["2.25rem",   { lineHeight: "2.5rem",   letterSpacing: "-0.03em"  }],
        "5xl":["3rem",      { lineHeight: "1.1",      letterSpacing: "-0.035em" }],
        "6xl":["3.75rem",   { lineHeight: "1.05",     letterSpacing: "-0.04em"  }],

        // Survey-specific tokens
        "survey-q":      ["1.1875rem", { lineHeight: "1.65",    letterSpacing: "-0.01em" }],
        "survey-option": ["1rem",      { lineHeight: "1.55",    letterSpacing: "0"       }],

        // UI chrome tokens
        eyebrow:         ["0.6875rem", { lineHeight: "1rem",    letterSpacing: "0.14em"  }],
        "form-label":    ["0.875rem",  { lineHeight: "1.25rem", letterSpacing: "0.01em"  }],
        "helper-text":   ["0.8125rem", { lineHeight: "1.5rem",  letterSpacing: "0"       }],
        nav:             ["0.9375rem", { lineHeight: "1",        letterSpacing: "0"       }],
      },

      // ─── Font Weights ─────────────────────────────────────────────────────
      fontWeight: {
        light:    "300",
        normal:   "400",
        medium:   "500",
        semibold: "600",
        bold:     "700",
      },

      // ─── Letter Spacing ───────────────────────────────────────────────────
      letterSpacing: {
        tighter:  "-0.04em",
        tight:    "-0.02em",
        snug:     "-0.01em",
        normal:   "0em",
        wide:     "0.025em",
        wider:    "0.075em",
        widest:   "0.14em",  // eyebrows / labels
      },

      // ─── Line Height ──────────────────────────────────────────────────────
      lineHeight: {
        none:       "1",
        tighter:    "1.05",
        tight:      "1.2",
        snug:       "1.35",
        normal:     "1.5",
        relaxed:    "1.625",
        loose:      "1.75",
        survey:     "1.65",  // optimal for question text
      },

      // ─── Max Width for Readable Lines ────────────────────────────────────
      maxWidth: {
        "prose-narrow": "55ch",
        "prose":        "65ch",
        "prose-wide":   "75ch",
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
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
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-accent": "var(--gradient-accent)",
        "gradient-subtle": "var(--gradient-subtle)",
      },
      boxShadow: {
        elegant: "var(--shadow-elegant)",
        glow: "var(--shadow-glow)",
      },
      transitionTimingFunction: {
        smooth: "var(--transition-smooth)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
