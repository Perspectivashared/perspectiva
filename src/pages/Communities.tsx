import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PaginatedCommunityGrid from "@/components/PaginatedCommunityGrid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorCard } from "@/shared/components/state/ErrorCard";
import {
  sortCommunities,
  toSortQueryValue,
  type Community,
  type CommunitySortOption,
} from "@/features/communities/domain/community-data";
import { useCommunitiesQuery } from "@/features/communities/hooks/use-communities-query";
import { favouriteCommunitiesKeys } from "@/features/communities/hooks/use-favourite-communities-query";
import { getCommunityRoute, ROUTES } from "@/lib/routes";
import { AsyncStateView } from "@/shared/components/state/AsyncStateView";
import { AppShell } from "@/shared/components/layout/AppShell";
import { queryToAsyncState } from "@/shared/lib/query-state";
import { api } from "@/lib/api";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useFavouriteCommunity } from "@/hooks/use-favourite-community";


interface CommunitySectionConfig {
  id: string;
  title: string;
  description: string;
  sort: CommunitySortOption;
}

const SECTION_CONFIGS: CommunitySectionConfig[] = [
  {
    id: "most-active",
    title: "Most Active Communities",
    description:
      "Communities with the strongest ongoing participation and activity levels.",
    sort: "mostActive",
  },
  {
    id: "most-surveyed",
    title: "Most Surveyed Communities",
    description: "Communities publishing the highest total volume of surveys.",
    sort: "mostSurveyed",
  },
  {
    id: "most-members",
    title: "Most Member Communities",
    description:
      "Largest communities by total member participation across the platform.",
    sort: "mostMembers",
  },
  {
    id: "trending",
    title: "Trending Communities",
    description:
      "Rising communities based on current activity and active survey momentum.",
    sort: "trending",
  },
  {
    id: "newest",
    title: "Recently Created Communities",
    description: "Newest communities recently launched with fresh discussions.",
    sort: "newest",
  },
];

const Communities = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const communitiesQuery = useCommunitiesQuery();
  const communitiesState = useMemo(
    () => queryToAsyncState(communitiesQuery),
    [communitiesQuery],
  );

  const favouritesQ = useQuery({
    queryKey: favouriteCommunitiesKeys.all,
    queryFn: () => api.get<Array<{ id: string }>>("/users/me/favourite-communities"),
    enabled: isAuthenticated === true,
  });

  const joinedQ = useQuery({
    queryKey: ["joined-communities"],
    queryFn: () => api.get<Array<{ id: string }>>("/users/me/joined-communities"),
    enabled: isAuthenticated === true,
  });

  const { favouriteIds, toggleFavourite: handleToggleFavouriteCommunity } =
    useFavouriteCommunity(favouritesQ.data ?? []);

  const joinedIds = useMemo(
    () => new Set((joinedQ.data ?? []).map((c) => c.id)),
    [joinedQ.data],
  );

  const handleExploreCommunity = useCallback(
    (communityId: string) => navigate(getCommunityRoute(communityId)),
    [navigate],
  );

  const handleRefetchError = useCallback(
    () => { communitiesQuery.refetch(); },
    [communitiesQuery],
  );

  const renderCommunitiesError = useCallback(
    (errorMessage: string) => (
      <ErrorCard
        title="Failed to load communities"
        message={errorMessage}
        onRetry={handleRefetchError}
      />
    ),
    [handleRefetchError],
  );

  const getSectionHref = (sectionSort: CommunitySortOption) => {
    const params = new URLSearchParams({
      sort: toSortQueryValue(sectionSort),
    });

    return `${ROUTES.allCommunities}?${params.toString()}`;
  };

  return (
    <AppShell withContainer mainClassName="pb-14 pt-24">
      <section className="mb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mb-3 text-4xl font-bold">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Communities
              </span>
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
              Explore communities by activity, survey volume, membership, and
              recency without horizontal browsing.
            </p>
          </div>

          <Button
            onClick={() => navigate(ROUTES.allCommunities)}
            className="w-full sm:w-auto"
          >
            View All Communities
          </Button>
        </div>
      </section>

      <AsyncStateView
        state={communitiesState}
        loading={
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={`community-skeleton-${i}`} className="h-[252px] rounded-xl" />
            ))}
          </div>
        }
        error={renderCommunitiesError}
        empty={
          <PaginatedCommunityGrid
            communities={[]}
            onExplore={handleExploreCommunity}
            emptyTitle="No communities found"
            emptyDescription="Please check back soon for newly added communities."
          />
        }
        isEmpty={(communities) => !communities || communities.length === 0}
        render={(communities) => {
          const safeCommunities = communities ?? [];
          const joinedCommunities = safeCommunities.filter((c) => joinedIds.has(c.id));
          const sections = SECTION_CONFIGS.map((section) => ({
            ...section,
            communities: sortCommunities(safeCommunities as Community[], section.sort).slice(0, 6),
          }));

          return (
            <div className="space-y-10">
              {isAuthenticated && joinedCommunities.length > 0 && (
                <section className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-semibold tracking-tight">Joined Communities</h2>
                    <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                      Communities you are a member of.
                    </p>
                  </div>
                  <PaginatedCommunityGrid
                    communities={joinedCommunities as Community[]}
                    onExplore={handleExploreCommunity}
                    onFavourite={handleToggleFavouriteCommunity}
                    isFavourited={(id) => favouriteIds.has(id)}
                    isJoined={() => true}
                    pageSize={6}
                    className="rounded-xl border border-border/60 bg-linear-to-b from-primary/3 to-transparent p-4 sm:p-5"
                  />
                </section>
              )}

              {sections.map((section) => (
                <section key={section.id} className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-3xl font-semibold tracking-tight">
                        {section.title}
                      </h2>
                      <div className="flex w-24 justify-end">
                        <Button
                          asChild
                          size="sm"
                          className="group h-9 w-9 origin-right justify-end overflow-hidden rounded-lg bg-gradient-primary px-2 text-primary-foreground shadow-elegant transition-all duration-200 ease-out hover:w-24 hover:bg-gradient-primary hover:shadow-glow focus-visible:w-24 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <Link
                            to={getSectionHref(section.sort)}
                            aria-label={`View all communities in ${section.title}`}
                          >
                            <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium opacity-0 transition-all duration-200 ease-out group-hover:mr-1 group-hover:max-w-14 group-hover:opacity-100 focus-visible:mr-1 focus-visible:max-w-14 focus-visible:opacity-100">
                              View all
                            </span>
                            <ArrowRight
                              className="h-3.5 w-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                      {section.description}
                    </p>
                  </div>

                  <PaginatedCommunityGrid
                    communities={section.communities}
                    onExplore={handleExploreCommunity}
                    onFavourite={isAuthenticated ? handleToggleFavouriteCommunity : undefined}
                    isFavourited={(id) => favouriteIds.has(id)}
                    isJoined={(id) => joinedIds.has(id)}
                    pageSize={6}
                    className="rounded-xl border border-border/60 bg-linear-to-b from-primary/3 to-transparent p-4 sm:p-5"
                  />
                </section>
              ))}
            </div>
          );
        }}
      />
    </AppShell>
  );
};

export default Communities;
