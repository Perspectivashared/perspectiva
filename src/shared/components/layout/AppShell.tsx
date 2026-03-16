import { type ReactNode } from "react";
import Navigation from "@/components/Navigation";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  children: ReactNode;
  showNavigation?: boolean;
  withContainer?: boolean;
  backgroundClassName?: string;
  mainClassName?: string;
}

export const AppShell = ({
  children,
  showNavigation = true,
  withContainer = false,
  backgroundClassName = "bg-background",
  mainClassName,
}: AppShellProps) => (
  <div className={cn("min-h-screen", backgroundClassName)}>
    {showNavigation ? <Navigation /> : null}
    <main className={cn(withContainer ? "container mx-auto px-4" : undefined, mainClassName)}>
      {children}
    </main>
  </div>
);
