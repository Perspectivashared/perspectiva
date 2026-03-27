import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ROUTES } from "@/lib/routes";
import { FullPageLoading } from "@/shared/components/feedback/FullPageLoading";
import type { ReactNode } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated === null) {
    return <FullPageLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.signIn} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
