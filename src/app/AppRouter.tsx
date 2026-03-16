import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { APP_ROUTES, APP_ROUTE_PATHS } from "@/app/route-registry";
import { FullPageLoading } from "@/shared/components/feedback/FullPageLoading";
import ProtectedRoute from "@/app/ProtectedRoute";

const PROTECTED_PATHS = new Set<string>([
  APP_ROUTE_PATHS.forYou,
  APP_ROUTE_PATHS.survey,
  APP_ROUTE_PATHS.createSurvey,
  APP_ROUTE_PATHS.profile,
  APP_ROUTE_PATHS.converter,
  APP_ROUTE_PATHS.editProfile,
  APP_ROUTE_PATHS.surveyAnalytics,
]);

export const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<FullPageLoading />}>
      <Routes>
        {APP_ROUTES.map(({ key, path, component: Component }) => (
          <Route
            key={key}
            path={path}
            element={
              PROTECTED_PATHS.has(path) ? (
                <ProtectedRoute>
                  <Component />
                </ProtectedRoute>
              ) : (
                <Component />
              )
            }
          />
        ))}
      </Routes>
    </Suspense>
  </BrowserRouter>
);
