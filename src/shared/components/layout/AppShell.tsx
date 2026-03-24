import { type ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  children: ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
  withContainer?: boolean;
  backgroundClassName?: string;
  mainClassName?: string;
}

export const AppShell = ({
  children,
  showNavigation = true,
  showFooter = true,
  withContainer = false,
  backgroundClassName = "bg-background",
  mainClassName,
}: AppShellProps) => (
  <div className={cn("min-h-screen", backgroundClassName)}>
    {showNavigation ? <Navigation /> : null}
    <main className={cn("app-shell-main", withContainer ? "container mx-auto px-4" : undefined, mainClassName)}>
      {children}
    </main>
    {showFooter ? <Footer /> : null}
  </div>
);
