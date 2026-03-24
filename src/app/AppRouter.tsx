import { Suspense } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { APP_ROUTES, APP_ROUTE_PATHS } from "@/app/route-registry";
import { FullPageLoading } from "@/shared/components/feedback/FullPageLoading";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageTransition } from "@/shared/components/layout/PageTransition";
import ProtectedRoute from "@/app/ProtectedRoute";

const PROTECTED_PATHS = new Set<string>([
  APP_ROUTE_PATHS.forYou,
  APP_ROUTE_PATHS.survey,
  APP_ROUTE_PATHS.createSurvey,
  APP_ROUTE_PATHS.profile,
  APP_ROUTE_PATHS.converter,
  APP_ROUTE_PATHS.editProfile,
  APP_ROUTE_PATHS.surveyAnalytics,
  APP_ROUTE_PATHS.drafts,
  APP_ROUTE_PATHS.surveyEdit,
]);

// Must be a separate component so useLocation runs inside <BrowserRouter>
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {APP_ROUTES.map(({ key, path, component: Component }) => (
          <Route
            key={key}
            path={path}
            element={
              <Suspense fallback={<FullPageLoading />}>
                {PROTECTED_PATHS.has(path) ? (
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
