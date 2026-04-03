import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/features/auth/context/AuthContext";

export const favouriteCommunitiesKeys = {
  all: ["favourite-communities"] as const,
};

export function useFavouriteCommunitiesQuery() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: favouriteCommunitiesKeys.all,
    queryFn: () => api.get<Array<{ id: string }>>("/users/me/favourite-communities"),
    enabled: isAuthenticated === true,
  });
}
