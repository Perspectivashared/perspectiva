import { cn } from "@/lib/utils";

interface FullPageLoadingProps {
  label?: string;
  className?: string;
}

export const FullPageLoading = ({
  label = "Loading...",
  className,
}: FullPageLoadingProps) => (
  <div
    className={cn(
      "min-h-screen flex items-center justify-center bg-background text-muted-foreground",
      className,
    )}
    role="status"
    aria-live="polite"
  >
    {label}
  </div>
);
