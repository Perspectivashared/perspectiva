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
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
    >
      Skip to main content
    </a>
    {showNavigation ? <Navigation /> : null}
    <main id="main-content" className={cn("app-shell-main", withContainer ? "container mx-auto px-4" : undefined, mainClassName)}>
      {children}
    </main>
    {showFooter ? <Footer /> : null}
  </div>
);
