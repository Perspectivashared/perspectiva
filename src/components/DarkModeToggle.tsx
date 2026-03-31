import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface DarkModeToggleProps {
  className?: string;
}

/**
 * Accessible sun/moon icon button that toggles between light and dark mode.
 * Reads and writes the theme via ThemeContext (persisted to localStorage).
 */
export const DarkModeToggle = ({ className }: DarkModeToggleProps) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={cn("shrink-0", className)}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
};
