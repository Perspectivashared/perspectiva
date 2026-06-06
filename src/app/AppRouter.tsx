import { Suspense } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { APP_ROUTES } from "@/app/route-registry";
import { FullPageLoading } from "@/shared/components/feedback/FullPageLoading";
import { ErrorBoundary } from "@/shared/components/feedback/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageTransition } from "@/shared/components/layout/PageTransition";
import ProtectedRoute from "@/app/ProtectedRoute";

// Must be a separate component so useLocation runs inside <BrowserRouter>
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="sync" initial={false}>
      <Routes location={location} key={location.pathname}>
        {APP_ROUTES.map(({ key, path, component: Component, protected: isProtected }) => (
          <Route
            key={key}
            path={path}
            element={
              <ErrorBoundary>
                <Suspense fallback={<FullPageLoading />}>
                  {isProtected ? (
                    <ProtectedRoute>
                      <PageTransition>
                        <Component />
                      </PageTransition>
                    </ProtectedRoute>
                  ) : (
                    <PageTransition>
                      <Component />
                    </PageTransition>
                  )}
                </Suspense>
              </ErrorBoundary>
            }
          />
        ))}
      </Routes>
    </AnimatePresence>
  );
};

export const AppRouter = () => (
  <BrowserRouter>
    <ScrollToTop />
    <AnimatedRoutes />
  </BrowserRouter>
);
