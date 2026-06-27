import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { BUTTON_STYLES } from "@/lib/button-styles";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Menu, LogOut, Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

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
  const [scrolled, setScrolled] = useState(() => window.scrollY > 20);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    toast({ title: "Signed out", description: "See you next time!" });
    navigate(ROUTES.home);
  }, [signOut, toast, navigate]);

  const { data: unreadData } = useQuery({
    queryKey: queryKeys.notificationsUnread(),
    queryFn: () => api.get<{ unread_count: number }>("/notifications/unread-count"),
    enabled: isAuthenticated === true,
    refetchInterval: 30_000,
    staleTime: 30_000,
  });
  const unreadCount = unreadData?.unread_count ?? 0;

  const { data: meData } = useQuery({
    queryKey: queryKeys.me(),
    queryFn: () => api.get<{ is_admin: boolean }>("/users/me"),
    enabled: isAuthenticated === true,
    staleTime: 5 * 60 * 1000,
  });
  const displayNavItems = [
    ...navItems,
    ...(meData?.is_admin === true ? [{ to: ROUTES.admin, label: "Admin" }] : []),
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 backdrop-blur-lg border-b transition-all duration-300",
        scrolled
          ? "bg-background/95 border-border shadow-xs"
          : "bg-background/50 border-border/50 shadow-none",
      )}
    >
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
            {displayNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-slot-link transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:rounded-sm ${
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
            <DarkModeToggle />
            {isAuthenticated && (
              <Link
                to={ROUTES.notifications}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            )}
            {isAuthenticated ? (
              <Button
                variant="outline"
                className={cn("hidden md:inline-flex items-center gap-2", BUTTON_STYLES.quietOutline)}
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className={cn("hidden md:inline-flex", BUTTON_STYLES.quietOutline)}
                >
                  <Link to={ROUTES.signIn}>Sign In</Link>
                </Button>
                <Button
                  asChild
                  className={BUTTON_STYLES.primaryAction}
                >
                  <Link to={ROUTES.signUp}>Get Started</Link>
                </Button>
              </>
            )}

            {isMobile ? (
              <Suspense
                fallback={
                  <Button
                    variant="outline"
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
                  navItems={displayNavItems}
                  isAuthenticated={isAuthenticated ?? undefined}
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
