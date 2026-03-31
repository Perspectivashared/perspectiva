import { Link, NavLink } from "react-router-dom";
import { Menu, LogOut } from "@/components/icons/simple-icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ROUTES } from "@/lib/routes";
import { DarkModeToggle } from "@/components/DarkModeToggle";

export interface NavigationMobileMenuProps {
  navItems: Array<{
    to: string;
    label: string;
  }>;
  isAuthenticated?: boolean;
  onSignOut?: () => void;
}

const NavigationMobileMenu = ({
  navItems,
  isAuthenticated,
  onSignOut,
}: NavigationMobileMenuProps) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline" size="icon" className="md:hidden">
        <Menu className="w-5 h-5" />
        <span className="sr-only">Open navigation menu</span>
      </Button>
    </SheetTrigger>
    <SheetContent side="right" className="w-[85%] max-w-sm">
      <div className="mt-10 flex flex-col gap-2">
        <div className="flex items-center justify-between px-3 pb-2 border-b border-border/40">
          <span className="text-sm text-muted-foreground">Appearance</span>
          <DarkModeToggle />
        </div>
        {navItems.map((item) => (
          <SheetClose key={item.to} asChild>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground"
                }`
              }
            >
              {item.label}
            </NavLink>
          </SheetClose>
        ))}
        <div className="mt-4 flex flex-col gap-2">
          {isAuthenticated ? (
            <SheetClose asChild>
              <Button
                variant="outline"
                onClick={onSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </SheetClose>
          ) : (
            <>
              <SheetClose asChild>
                <Button asChild variant="outline">
                  <Link to={ROUTES.signIn}>Sign In</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild>
                  <Link to={ROUTES.signUp}>Get Started</Link>
                </Button>
              </SheetClose>
            </>
          )}
        </div>
      </div>
    </SheetContent>
  </Sheet>
);

export default NavigationMobileMenu;
