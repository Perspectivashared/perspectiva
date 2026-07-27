import { type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SectionHeaderProps {
  title: string;
  description?: string;
  /** Optional secondary count/summary line (e.g. "12 surveys"). */
  countLabel?: string;
  action?: ReactNode;
  /** Renders skeleton placeholders in place of the title/description. */
  isLoading?: boolean;
}

/**
 * Canonical section header. h2 inherits the serif display font (Fraunces) from
 * the base element styles. Absorbs the former PageHeaderCard's loading state.
 */
export const SectionHeader = ({
  title,
  description,
  countLabel,
  action,
  isLoading = false,
}: SectionHeaderProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-full max-w-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {action ? (
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
          {action}
        </div>
      ) : (
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      )}
      {description && (
        <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
          {description}
        </p>
      )}
      {countLabel && (
        <p className="text-sm text-muted-foreground">{countLabel}</p>
      )}
    </div>
  );
};
