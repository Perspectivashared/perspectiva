import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground shadow-elegant hover:brightness-105 hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.25),0_8px_24px_-4px_hsl(195_85%_45%/0.55)] transition-all focus-visible:ring-[3px] focus-visible:ring-primary/70 focus-visible:ring-offset-2",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/70",
        outline:
          "border border-primary/20 bg-primary/10 text-primary [--btn-ring:hsl(var(--primary)_/_0.2)] hover:bg-primary/20 hover:text-[hsl(195_85%_28%)] hover:border-primary/50 hover:shadow-[0_0_0_3px_var(--btn-ring)] transition-all focus-visible:ring-primary/40",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-primary/40 focus-visible:ring-offset-0",
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
