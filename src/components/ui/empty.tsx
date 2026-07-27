import * as React from "react";

import { cn } from "@/lib/utils";

/** Editorial empty-state scaffold: Empty > EmptyMedia / EmptyTitle / EmptyDescription / EmptyContent. */
const Empty = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/70 bg-card/40 px-6 py-14 text-center",
        className,
      )}
      {...props}
    />
  ),
);
Empty.displayName = "Empty";

const EmptyMedia = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:h-6 [&_svg]:w-6",
        className,
      )}
      {...props}
    />
  ),
);
EmptyMedia.displayName = "EmptyMedia";

const EmptyTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    // h3 inherits the serif display font (Fraunces) from base element styles.
    <h3 ref={ref} className={cn("text-lg font-semibold tracking-tight", className)} {...props} />
  ),
);
EmptyTitle.displayName = "EmptyTitle";

const EmptyDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("max-w-sm text-sm text-muted-foreground", className)} {...props} />
  ),
);
EmptyDescription.displayName = "EmptyDescription";

const EmptyContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mt-2 flex items-center justify-center gap-2", className)} {...props} />
  ),
);
EmptyContent.displayName = "EmptyContent";

export { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent };
