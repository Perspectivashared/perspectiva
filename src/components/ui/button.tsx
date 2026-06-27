import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-sm font-medium ring-offset-background transition-all duration-200 focus:outline-hidden focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-primary/50 bg-gradient-primary text-primary-foreground shadow-[0_10px_24px_-16px_hsl(var(--primary)/0.85)] hover:border-primary/80 hover:brightness-105 hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.18),0_14px_32px_-16px_hsl(var(--primary)/0.95)] focus-visible:ring-primary/35",
        secondary:
          "border-border bg-secondary text-secondary-foreground shadow-xs hover:border-foreground/35 hover:bg-secondary/80 hover:shadow-[0_0_0_3px_hsl(var(--foreground)/0.08),0_10px_24px_-18px_hsl(var(--foreground)/0.35)] focus-visible:ring-foreground/20",
        destructive:
          "border-destructive/70 bg-destructive text-destructive-foreground shadow-xs hover:border-destructive hover:bg-destructive/90 hover:shadow-[0_0_0_3px_hsl(var(--destructive)/0.2),0_14px_32px_-18px_hsl(var(--destructive)/0.8)] focus-visible:ring-destructive/35",
        outline:
          "border-border bg-background text-foreground shadow-xs hover:border-primary/60 hover:bg-primary/8 hover:text-primary hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.12),0_10px_24px_-18px_hsl(var(--primary)/0.45)] focus-visible:ring-primary/30",
        ghost:
          "border-transparent bg-transparent text-foreground shadow-none hover:bg-primary/10 hover:text-primary focus-visible:ring-primary/25",
        link: "border-transparent bg-transparent px-0 text-primary shadow-none underline-offset-4 hover:text-primary/80 hover:underline focus-visible:ring-primary/30 focus-visible:ring-offset-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
