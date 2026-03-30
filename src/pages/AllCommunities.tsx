import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, SESSION_EXPIRED } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth/context/AuthContext";
import CommunityFilterBar from "@/components/CommunityFilterBar";
import PaginatedCommunityGrid from "@/components/PaginatedCommunityGrid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  COMMUNITY_FILTER_OPTIONS,
  applyCommunityQuery,
  fromSortQueryValue,
  normalizeCategoryFilter,
  toSortQueryValue,
  type CommunityCategoryFilter,
  type CommunitySortOption,
} from "@/features/communities/domain/community-data";
import { useCommunitiesQuery } from "@/features/communities/hooks/use-communities-query";
import { getCommunityRoute } from "@/lib/routes";
import { AppShell } from "@/shared/components/layout/AppShell";
import { AsyncStateView } from "@/shared/components/state/AsyncStateView";
import { queryToAsyncState } from "@/shared/lib/query-state";
import { setQueryParam } from "@/shared/lib/query-params";

const AllCommunities = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const communitiesQuery = useCommunitiesQuery();
  const communitiesState = useMemo(
    () => queryToAsyncState(communitiesQuery),
    [communitiesQuery],
  );

  const favouritesQ = useQuery({
    queryKey: ["favourite-communities"],
    queryFn: () => api.get<Array<{ id: string }>>("/users/me/favourite-communities"),
    enabled: isAuthenticated === true,
  });

  const [localFavouriteIds, setLocalFavouriteIds] = useState<Set<string>>(new Set());

  const favouriteIds = useMemo(
    () => new Set([...localFavouriteIds, ...(favouritesQ.data ?? []).map((c) => c.id)]),
    [localFavouriteIds, favouritesQ.data],
  );

  const handleToggleFavouriteCommunity = async (communityId: string) => {
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
      if (err instanceof Error && err.message === SESSION_EXPIRED) {
        throw err;
      }
      toast({ title: "Failed to update favourite", variant: "destructive" });
    }
  };

  const categoryFilter = normalizeCategoryFilter(searchParams.get("category"));
  const sortBy = fromSortQueryValue(searchParams.get("sort"));

  useEffect(() => {
    if (searchParams.get("sort")) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    setQueryParam(nextParams, "sort", toSortQueryValue(sortBy));
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams, sortBy]);

  const updateQueryState = (
    nextCategory: CommunityCategoryFilter,
    nextSort: CommunitySortOption,
  ) => {
    const nextParams = new URLSearchParams(searchParams);
    setQueryParam(nextParams, "sort", toSortQueryValue(nextSort));
    setQueryParam(nextParams, "category", nextCategory === "all" ? undefined : nextCategory);
    setSearchParams(nextParams);
  };

  const handleExploreCommunity = (communityId: string) => {
    navigate(getCommunityRoute(communityId));
  };

  return (
    <AppShell withContainer mainClassName="pb-14 pt-24">
      <AsyncStateView
        state={communitiesState}
        loading={
          <div>
            <section className="mb-10 space-y-2 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/[0.08] via-card to-card p-5">
              <Skeleton className="mb-3 h-12 w-72" />
              <Skeleton className="h-5 w-full max-w-3xl" />
            </section>
            <section className="mb-10">
              <Skeleton className="h-[86px] rounded-xl" />
            </section>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <Skeleton key={index} className="h-[252px] rounded-xl" />
              ))}
            </div>
          </div>
        }
        error={(errorMessage) => (
          <Card className="border-border/70 p-8 text-center shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight">
              Failed to load communities
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
            <Button onClick={() => void communitiesQuery.refetch()} className="mt-5">
              Try again
            </Button>
          </Card>
        )}
        render={(communities) => {
          const visibleCommunities = applyCommunityQuery(communities ?? [], {
            category: categoryFilter,
            sort: sortBy,
          });

          return (
            <>
              <section className="mb-10 space-y-2 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/[0.08] via-card to-card p-5">
                <h1 className="mb-3 text-4xl font-bold">
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    All Communities
                  </span>
                </h1>
                <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                  Browse every community by topic, activity, survey volume, and launch
                  recency.
                </p>
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  {visibleCommunities.length === 1
                    ? "1 community"
                    : `${visibleCommunities.length} communities`}
                </p>
              </section>

              <section className="mb-10">
                <CommunityFilterBar
                  category={categoryFilter}
                  onCategoryChange={(value) => updateQueryState(value, sortBy)}
                  sortBy={sortBy}
                  onSortChange={(value) => updateQueryState(categoryFilter, value)}
                  categories={COMMUNITY_FILTER_OPTIONS}
                  idPrefix="all-communities"
                />
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Community Directory
                </h2>

                <PaginatedCommunityGrid
                  communities={visibleCommunities}
                  onExplore={handleExploreCommunity}
                  onFavourite={isAuthenticated ? handleToggleFavouriteCommunity : undefined}
                  isFavourited={(id) => favouriteIds.has(id)}
                  pageSize={9}
                  emptyTitle="No communities match your filters"
                  emptyDescription="Change category or sort order to discover more communities."
                  className="rounded-xl border border-border/60 bg-gradient-to-b from-primary/[0.03] to-transparent p-4 sm:p-5"
                />
              </section>
            </>
          );
        }}
      />
    </AppShell>
  );
};

export default AllCommunities;
