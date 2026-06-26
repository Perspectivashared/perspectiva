import type { QueryClient } from "@tanstack/react-query";
import type { NavigateFunction } from "react-router-dom";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ROUTES } from "@/lib/routes";
import type { ApiUser } from "@/features/profile/services/profile-service";

type MeFlags = Pick<ApiUser, "email_verified" | "onboarding_completed" | "is_admin">;

/**
 * Where a freshly-authenticated user belongs:
 *  - unverified email  → verify-email screen (Gate 1)
 *  - verified, not yet onboarded → categorizer (Gate 2)
 *  - otherwise → the For You feed.
 * Admins skip both gates.
 */
export const resolvePostAuthRoute = (me: MeFlags): string => {
  if (me.is_admin) return ROUTES.forYou;
  if (!me.email_verified) return ROUTES.verifyEmail;
  if (!me.onboarding_completed) return ROUTES.categorizer;
  return ROUTES.forYou;
};

/**
 * Fetch the freshest /users/me, prime the shared cache, and navigate to the
 * correct gate. Falls back to sign-in if the session is not valid.
 */
export const redirectAfterAuth = async (
  navigate: NavigateFunction,
  queryClient: QueryClient,
): Promise<void> => {
  try {
    const me = await api.get<ApiUser>("/users/me");
    queryClient.setQueryData(queryKeys.me(), me);
    navigate(resolvePostAuthRoute(me), { replace: true });
  } catch {
    navigate(ROUTES.signIn, { replace: true });
  }
};
