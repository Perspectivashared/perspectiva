import { Suspense, useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { APP_ROUTES } from "@/app/route-registry";
import { RouteMeta } from "@/app/RouteMeta";
import { FullPageLoading } from "@/shared/components/feedback/FullPageLoading";
import { ErrorBoundary } from "@/shared/components/feedback/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageTransition } from "@/shared/components/layout/PageTransition";
import ProtectedRoute from "@/app/ProtectedRoute";
import { RequireOnboarded, RequireVerified } from "@/app/OnboardingGuards";

// Must be a separate component so useLocation runs inside <BrowserRouter>
const AnimatedRoutes = () => {
  const location = useLocation();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    setAnnouncement(document.title || "New page");
  }, [location.pathname]);

  return (
    <>
      <RouteMeta />
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    <AnimatePresence mode="sync" initial={false}>
      <Routes location={location} key={location.pathname}>
        {APP_ROUTES.map(({ key, path, component: Component, protected: isProtected, guard }) => {
          let content = (
            <PageTransition>
              <Component />
            </PageTransition>
          );
          if (guard === "verified") content = <RequireVerified>{content}</RequireVerified>;
          if (guard === "onboarded") content = <RequireOnboarded>{content}</RequireOnboarded>;
          if (isProtected) content = <ProtectedRoute>{content}</ProtectedRoute>;

          return (
            <Route
              key={key}
              path={path}
              element={
                <ErrorBoundary>
                  <Suspense fallback={<FullPageLoading />}>{content}</Suspense>
                </ErrorBoundary>
              }
            />
          );
        })}
      </Routes>
    </AnimatePresence>
    </>
  );
};

export const AppRouter = () => (
  <BrowserRouter>
    <ScrollToTop />
    <AnimatedRoutes />
  </BrowserRouter>
);
