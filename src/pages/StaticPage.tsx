import { ReactNode } from "react";
import { AppShell } from "@/shared/components/layout/AppShell";

export interface StaticPageProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export const StaticPage = ({
  title,
  description,
  children,
}: StaticPageProps) => (
  <AppShell
    withContainer
    mainClassName="max-w-4xl px-4 pb-12 pt-24"
    backgroundClassName="bg-gradient-subtle"
  >
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">{title}</h1>
        {description ? (
          <p className="text-lg text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div className="prose prose-invert max-w-none">{children}</div>
    </div>
  </AppShell>
);
