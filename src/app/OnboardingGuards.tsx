import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useMe } from "@/features/auth/hooks/useMe";
import { ROUTES } from "@/lib/routes";
import { FullPageLoading } from "@/shared/components/feedback/FullPageLoading";

/**
 * Gate 1 — require a verified email. Redirects to the verify-email screen
 * otherwise. Used to wrap the categorizer route. Admins are exempt.
 */
export const RequireVerified = ({ children }: { children: ReactNode }) => {
  const { data: me, isLoading } = useMe();
  if (isLoading) return <FullPageLoading />;
  if (me && !me.is_admin && !me.email_verified) {
    return <Navigate to={ROUTES.verifyEmail} replace />;
  }
  return <>{children}</>;
};

/**
 * Gate 2 — require categorizer completion (which implies a verified email).
 * Redirects to verify-email or the categorizer as appropriate. Wraps the
 * survey take/create/edit routes. Admins are exempt. The backend's
 * `require_onboarded` dependency is the real enforcement; this is UX.
 */
export const RequireOnboarded = ({ children }: { children: ReactNode }) => {
  const { data: me, isLoading } = useMe();
  if (isLoading) return <FullPageLoading />;
  if (me && !me.is_admin) {
    if (!me.email_verified) return <Navigate to={ROUTES.verifyEmail} replace />;
    if (!me.onboarding_completed) return <Navigate to={ROUTES.categorizer} replace />;
  }
  return <>{children}</>;
};
