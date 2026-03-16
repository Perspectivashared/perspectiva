import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import logo from "@/assets/logo.png";
import { ROUTES } from "@/lib/routes";
import { Menu, LogOut } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { to: ROUTES.forYou, label: "For You" },
  { to: ROUTES.createSurvey, label: "Create Survey" },
  { to: ROUTES.communities, label: "Communities" },
  { to: ROUTES.pricing, label: "Pricing" },
  { to: ROUTES.profile, label: "Profile" },
];

const Navigation = () => {
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = () => {
    signOut();
    toast({ title: "Signed out", description: "See you next time!" });
    navigate(ROUTES.home);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={ROUTES.home} className="flex items-center gap-2">
            <img src={logo} alt="Perspectiva Logo" className="w-10 h-10" />
            <span className="text-xl font-bold text-foreground">
              PERSPECTIVA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `transition-colors ${
                    isActive
                      ? "text-foreground font-medium"
                      : "text-foreground/80 hover:text-foreground"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button
                variant="ghost"
                className="hidden md:inline-flex items-center gap-2 text-foreground/80 hover:text-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <>
                <Link
                  to={ROUTES.signIn}
                  className="hidden md:inline-flex text-foreground/80 hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Button
                  asChild
                  className="bg-gradient-primary shadow-elegant hover:shadow-glow transition-all"
                >
                  <Link to={ROUTES.signUp}>Get Started</Link>
                </Button>
              </>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85%] max-w-sm">
                <div className="mt-10 flex flex-col gap-2">
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
                        <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
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
                          <Button asChild className="bg-gradient-primary">
                            <Link to={ROUTES.signUp}>Get Started</Link>
                          </Button>
                        </SheetClose>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
