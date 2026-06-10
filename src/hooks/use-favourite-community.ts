import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError, SESSION_EXPIRED } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

/**
 * Manages optimistic favourite/unfavourite toggling for communities.
 *
 * Uses an override map (same pattern as use-save-survey) instead of a
 * pure-addition set so that optimistic *unfavourites* correctly hide items
 * that are still present in server data while the refetch is in flight:
 *
 *   override[id] = true  → show as favourited (overrides server)
 *   override[id] = false → show as unfavourited (overrides server)
 *   override[id] missing → follow server data
 */
export function useFavouriteCommunity(
  favouriteCommunities: Array<{ id: string }> = [],
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [overrides, setOverrides] = useState<Map<string, boolean>>(new Map());

  const favouriteIds = useMemo(() => {
    const result = new Set<string>();
    for (const { id } of favouriteCommunities) {
      if (overrides.get(id) !== false) result.add(id);
    }
    for (const [id, favourited] of overrides) {
      if (favourited) result.add(id);
    }
    return result;
  }, [overrides, favouriteCommunities]);

  const toggleFavourite = useCallback(
    async (communityId: string) => {
      const isFav = favouriteIds.has(communityId);
      setOverrides((prev) => new Map(prev).set(communityId, !isFav));
      try {
        if (isFav) {
          await api.delete(`/communities/${communityId}/favourite`);
        } else {
          await api.post(`/communities/${communityId}/favourite`);
        }
        await queryClient.invalidateQueries({ queryKey: ["favourite-communities"] });
        setOverrides((prev) => {
          const next = new Map(prev);
          next.delete(communityId);
          return next;
        });
      } catch (err) {
        setOverrides((prev) => new Map(prev).set(communityId, isFav));
        if (err instanceof ApiError && err.code === SESSION_EXPIRED) throw err;
        toast({ title: "Failed to update favourite", variant: "destructive" });
      }
    },
    [favouriteIds, queryClient, toast],
  );

  return { favouriteIds, toggleFavourite };
}
