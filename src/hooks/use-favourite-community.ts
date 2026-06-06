import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, SESSION_EXPIRED } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

/**
 * Manages optimistic favourite/unfavourite toggling for communities.
 * Pass the current server-side favourites list; the hook merges it with
 * a local optimistic layer and exposes a stable `toggleFavourite` callback.
 */
export function useFavouriteCommunity(
  favouriteCommunities: Array<{ id: string }> = [],
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [localFavouriteIds, setLocalFavouriteIds] = useState<Set<string>>(
    new Set(),
  );

  const favouriteIds = useMemo(
    () =>
      new Set([
        ...localFavouriteIds,
        ...favouriteCommunities.map((c) => c.id),
      ]),
    [localFavouriteIds, favouriteCommunities],
  );

  const toggleFavourite = useCallback(
    async (communityId: string) => {
      const isFav = favouriteIds.has(communityId);
      setLocalFavouriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) { next.delete(communityId); } else { next.add(communityId); }
        return next;
      });
      try {
        if (isFav) {
          await api.delete(`/communities/${communityId}/favourite`);
        } else {
          await api.post(`/communities/${communityId}/favourite`);
        }
        queryClient.invalidateQueries({ queryKey: ["favourite-communities"] });
      } catch (err) {
        setLocalFavouriteIds((prev) => {
          const next = new Set(prev);
          if (isFav) { next.add(communityId); } else { next.delete(communityId); }
          return next;
        });
        if (err instanceof Error && err.message === SESSION_EXPIRED) throw err;
        toast({ title: "Failed to update favourite", variant: "destructive" });
      }
    },
    [favouriteIds, queryClient, toast],
  );

  return { favouriteIds, toggleFavourite };
}
