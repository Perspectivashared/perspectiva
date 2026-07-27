export const BUTTON_STYLES = {
  primaryAction:
    "bg-primary text-primary-foreground shadow-sm hover:bg-[hsl(var(--primary-hover))] focus-visible:ring-2 focus-visible:ring-ring",
  quietOutline:
    "border-border bg-background text-foreground shadow-xs hover:border-primary/50 hover:bg-primary/8 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring",
  quietIcon:
    "h-10 w-10 rounded-md border-border bg-background text-foreground shadow-xs hover:border-primary/50 hover:bg-primary/8 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring",
  cardBase:
    "h-11 w-full font-semibold shadow-xs transition-all duration-200",
  cardPrimary:
    "bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))] focus-visible:ring-2 focus-visible:ring-ring",
  cardOutline:
    "border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/8 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring",
  // Coin buttons keep the semantic gold scale (AA-tuned per theme); glow dropped.
  coinPrimary:
    "border-[hsl(38_92%_38%/0.55)] bg-[hsl(38_92%_38%)] text-white hover:bg-[hsl(38_92%_34%)] focus-visible:ring-2 focus-visible:ring-[hsl(38_92%_38%/0.5)] dark:bg-[hsl(38_92%_62%)] dark:text-[hsl(210_20%_8%)] dark:hover:bg-[hsl(38_92%_68%)]",
  coinIcon:
    "h-8 w-8 rounded-full border-[hsl(38_92%_38%/0.35)] bg-[hsl(38_92%_38%/0.08)] text-[hsl(32_95%_28%)] shadow-xs hover:border-[hsl(38_92%_38%/0.62)] hover:bg-[hsl(38_92%_38%/0.16)] hover:text-[hsl(32_95%_22%)] focus-visible:ring-2 focus-visible:ring-[hsl(38_92%_38%/0.4)] dark:border-[hsl(38_92%_72%/0.35)] dark:bg-[hsl(38_92%_72%/0.12)] dark:text-[hsl(38_92%_72%)] dark:hover:bg-[hsl(38_92%_72%/0.2)]",
  selectorBase:
    "rounded-full border px-3 py-1.5 text-sm font-medium shadow-xs transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  selectorActive:
    "border-transparent bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))] focus-visible:ring-ring",
  selectorInactive:
    "border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/8 hover:text-primary focus-visible:ring-ring",
  disclosure:
    "w-full rounded-md border border-border bg-background px-4 py-3 text-foreground shadow-xs transition-all duration-200 hover:border-primary/50 hover:bg-primary/8 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
} as const;
