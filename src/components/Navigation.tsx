import { Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { ROUTES } from "@/lib/routes";
import { Menu, LogOut } from "@/components/icons/simple-icons";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const NavigationMobileMenu = lazy(
  () => import("@/components/navigation-mobile-menu"),
);

const navItems = [
  { to: ROUTES.forYou, label: "For You" },
  { to: ROUTES.createSurvey, label: "Create Survey" },
  { to: ROUTES.communities, label: "Communities" },
  { to: ROUTES.pricing, label: "Pricing" },
  { to: ROUTES.profile, label: "Profile" },
];

const Navigation = () => {
  const { isAuthenticated, signOut } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = () => {
    signOut();
    toast({ title: "Signed out", description: "See you next time!" });
    navigate(ROUTES.home);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/[0.5] backdrop-blur-lg border-b border-border/50">
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
          <div className="hidden md:flex items-center gap-10 lg:gap-12">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-slot-link transition-colors focus-visible:text-foreground ${
                    isActive
                      ? "is-active text-foreground font-medium"
                      : "text-foreground/80 hover:text-foreground"
                  }`
                }
              >
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button
                className="hidden md:inline-flex items-center gap-2 bg-gradient-primary shadow-elegant hover:shadow-glow transition-all"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            ) : (
              <>
                <Link
                  to={ROUTES.signIn}
                  className="nav-slot-link hidden md:inline-flex text-foreground/80 hover:text-foreground focus-visible:text-foreground transition-colors"
                >
                  <span>Sign In</span>
                </Link>
                <Button
                  asChild
                  className="bg-gradient-primary shadow-elegant hover:shadow-glow transition-all"
                >
                  <Link to={ROUTES.signUp}>Get Started</Link>
                </Button>
              </>
            )}

            {isMobile ? (
              <Suspense
                fallback={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    disabled
                  >
                    <Menu className="w-5 h-5" />
                    <span className="sr-only">Open navigation menu</span>
                  </Button>
                }
              >
                <NavigationMobileMenu
                  navItems={navItems}
                  isAuthenticated={isAuthenticated}
                  onSignOut={handleSignOut}
                />
              </Suspense>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
