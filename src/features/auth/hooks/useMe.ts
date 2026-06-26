import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { ApiUser } from "@/features/profile/services/profile-service";

/**
 * The current user (GET /users/me) shared via a single cache entry. Onboarding
 * guards and the post-auth redirect read `email_verified` / `onboarding_completed`
 * from here. Returns `undefined` while loading or if the request fails.
 */
export const useMe = () =>
  useQuery({
    queryKey: queryKeys.me(),
    queryFn: () => api.get<ApiUser>("/users/me"),
    staleTime: 60_000,
    retry: false,
  });
