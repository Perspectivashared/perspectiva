export const BUTTON_STYLES = {
  primaryAction:
    "border-primary/50 bg-gradient-primary text-primary-foreground shadow-[0_10px_24px_-16px_hsl(var(--primary)/0.85)] hover:border-primary/80 hover:brightness-105 hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.18),0_14px_32px_-16px_hsl(var(--primary)/0.95)] focus-visible:ring-4 focus-visible:ring-primary/35",
  quietOutline:
    "border-border bg-background text-foreground shadow-sm hover:border-primary/60 hover:bg-primary/8 hover:text-primary hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.12),0_10px_24px_-18px_hsl(var(--primary)/0.45)] focus-visible:ring-4 focus-visible:ring-primary/30",
  quietIcon:
    "h-10 w-10 rounded-md border-border bg-background text-foreground shadow-sm hover:border-primary/60 hover:bg-primary/8 hover:text-primary hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.12),0_10px_24px_-18px_hsl(var(--primary)/0.45)] focus-visible:ring-4 focus-visible:ring-primary/30",
  cardBase:
    "h-11 w-full font-semibold shadow-sm transition-all duration-200",
  cardPrimary:
    "border-primary/50 bg-gradient-primary text-primary-foreground hover:border-primary/80 hover:brightness-105 hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.16),0_12px_28px_-18px_hsl(var(--primary)/0.9)] focus-visible:ring-4 focus-visible:ring-primary/35",
  cardOutline:
    "border-border bg-background text-foreground hover:border-primary/60 hover:bg-primary/8 hover:text-primary hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] focus-visible:ring-4 focus-visible:ring-primary/30",
  coinPrimary:
    "border-[hsl(38_92%_38%/0.55)] bg-[hsl(38_92%_38%)] text-white hover:border-[hsl(38_92%_34%)] hover:bg-[hsl(38_92%_34%)] hover:shadow-[0_0_0_3px_hsl(38_92%_38%/0.18),0_12px_28px_-18px_hsl(38_92%_38%/0.85)] focus-visible:ring-4 focus-visible:ring-[hsl(38_92%_38%/0.35)] dark:border-[hsl(38_92%_62%/0.6)] dark:bg-[hsl(38_92%_62%)] dark:text-[hsl(210_20%_8%)] dark:hover:bg-[hsl(38_92%_68%)] dark:hover:shadow-[0_0_0_3px_hsl(38_92%_62%/0.2),0_12px_28px_-18px_hsl(38_92%_62%/0.75)] dark:focus-visible:ring-[hsl(38_92%_62%/0.35)]",
  coinIcon:
    "h-8 w-8 rounded-full border-[hsl(38_92%_38%/0.35)] bg-[hsl(38_92%_38%/0.08)] text-[hsl(32_95%_28%)] shadow-sm hover:border-[hsl(38_92%_38%/0.62)] hover:bg-[hsl(38_92%_38%/0.16)] hover:text-[hsl(32_95%_22%)] hover:shadow-[0_0_0_3px_hsl(38_92%_38%/0.12),0_8px_18px_-14px_hsl(38_92%_38%/0.65)] focus-visible:ring-4 focus-visible:ring-[hsl(38_92%_38%/0.35)] dark:border-[hsl(38_92%_72%/0.35)] dark:bg-[hsl(38_92%_72%/0.12)] dark:text-[hsl(38_92%_72%)] dark:hover:bg-[hsl(38_92%_72%/0.2)] dark:hover:shadow-[0_0_0_3px_hsl(38_92%_72%/0.16),0_8px_18px_-14px_hsl(38_92%_72%/0.65)] dark:focus-visible:ring-[hsl(38_92%_72%/0.35)]",
  selectorBase:
    "rounded-full border px-3 py-1.5 text-sm font-medium shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:ring-offset-2",
  selectorActive:
    "border-primary/50 bg-gradient-primary text-primary-foreground hover:border-primary/80 hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.14)] focus-visible:ring-primary/35",
  selectorInactive:
    "border-border bg-background text-foreground hover:border-primary/60 hover:bg-primary/8 hover:text-primary hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] focus-visible:ring-primary/30",
  disclosure:
    "w-full rounded-md border border-border bg-background px-4 py-3 text-foreground shadow-sm transition-all duration-200 hover:border-primary/60 hover:bg-primary/8 hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.1),0_10px_24px_-20px_hsl(var(--primary)/0.45)] focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
} as const;
