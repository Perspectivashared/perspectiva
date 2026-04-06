import { type ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const SectionHeader = ({ title, description, action }: SectionHeaderProps) => (
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
  </div>
);
