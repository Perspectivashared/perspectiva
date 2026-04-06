import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, SESSION_EXPIRED } from "@/lib/api";
import { Activity, ArrowRight, FileText, Trophy, Users, UserPlus, UserMinus, Check } from "lucide-react";
import PaginatedCommunityGrid from "@/components/PaginatedCommunityGrid";
import { SurveyCard, type ApiSurveySummary } from "@/components/SurveyCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  sortCommunities,
  type Community,
} from "@/features/communities/domain/community-data";
import {
  useCommunitiesQuery,
  useCommunityByIdQuery,
} from "@/features/communities/hooks/use-communities-query";
import { apiCommunityRepository } from "@/features/communities/services/community-repository";
import { useToast } from "@/hooks/use-toast";
import { getCommunityRoute, ROUTES } from "@/lib/routes";
import { AppShell } from "@/shared/components/layout/AppShell";
import { queryToAsyncState } from "@/shared/lib/query-state";

interface LeaderboardEntry {
  username: string;
  name: string;
  surveys_completed: number;
  rank: number;
}

const Sparkline = ({ value }: { value: number }) => (
  <svg width="40" height="14" viewBox="0 0 40 14" aria-hidden="true" className="inline-block">
    {value > 0 ? (
      <polyline
        points="0,12 7,10 14,7 21,8 28,4 35,5 40,3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <line x1="0" y1="9" x2="40" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
    )}
  </svg>
);

const CommunityOverview = ({
  community,
  onJoin,
  onLeave,
  isJoining,
  isLeaving,
}: {
  community: Community;
  onJoin: () => void;
  onLeave: () => void;
  isJoining: boolean;
  isLeaving: boolean;
}) => {
  const Icon = community.icon;
  const joined = community.isMember;

  return (
    <section className="mb-12">
      <Card className="border border-primary/20 p-6 shadow-sm md:p-8">
        <div>
          <div className="space-y-4">
          {/* Icon + Category + Title */}
          <div className="flex items-center gap-4">
            <div className="shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 dark:ring-primary/30 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.35)] dark:shadow-[0_0_28px_-5px_hsl(var(--primary)/0.55)]">
              <Icon className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/55">
                {community.category}
              </p>
              <h1 className="bg-gradient-primary bg-clip-text text-3xl font-bold tracking-tight text-transparent leading-tight md:text-4xl">
                {community.name}
              </h1>
            </div>
          </div>

          {/* Description */}
          <p className="max-w-3xl text-sm leading-relaxed text-foreground/60 dark:text-foreground/80 md:text-[15px]">
            {community.longDescription}
          </p>

          {/* Tags */}
          {community.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {community.subcategories.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-primary dark:bg-primary/[0.18]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Metrics strip */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/40 pt-3">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary/60" />
              <span className="text-sm font-semibold text-foreground/85">{community.members.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground/55">Members</span>
            </div>
            <span className="text-border/70" aria-hidden="true">·</span>
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary/60" />
              <span className="text-sm font-semibold text-foreground/85">{community.surveys.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground/55">Surveys</span>
            </div>
            <span className="text-border/70" aria-hidden="true">·</span>
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-primary/60" />
              <span className="text-sm font-semibold text-foreground/85">{community.activityLevel}%</span>
              <span className="text-xs text-muted-foreground/55">Activity</span>
              <span className="text-primary/55 -mb-0.5">
                <Sparkline value={community.activityLevel} />
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            {joined ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="pointer-events-none border-emerald-500 bg-emerald-500/15 text-emerald-500 font-semibold"
                  tabIndex={-1}
                >
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Joined
                </Button>
                <button
                  type="button"
                  onClick={onLeave}
                  disabled={isLeaving}
                  className="inline-flex items-center gap-1.5 rounded-md border border-transparent px-3 py-[7px] text-[13px] font-medium text-red-500/70 transition-all hover:border-red-500/30 hover:text-red-500 disabled:opacity-50"
                >
                  <UserMinus className="h-3.5 w-3.5" />
                  {isLeaving ? "Leaving…" : "Leave"}
                </button>
              </>
            ) : (
              <Button size="sm" onClick={onJoin} disabled={isJoining}>
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                {isJoining ? "Joining…" : "Join Community"}
              </Button>
            )}
          </div>
          </div>{/* end space-y-4 */}
        </div>
      </Card>
    </section>
  );
};

const SurveysSection = ({
  surveys,
  isSaved,
  onToggleSave,
  communityId,
}: {
  surveys: ApiSurveySummary[];
  isSaved: (id: number) => boolean;
  onToggleSave: (id: number) => void;
  communityId: string;
}) => (
  <section className="mb-12 space-y-6">
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Active Surveys</h2>
          <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
            Participate in current studies and add your perspective to this
            community&apos;s active research stream.
          </p>
        </div>
        {surveys.length > 0 && (
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link to={`${ROUTES.allSurveys}?community=${communityId}`}>
              View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </div>
    </div>

    {surveys.length === 0 ? (
      <Card className="border-border/70 p-8 text-center shadow-sm">
        <p className="text-muted-foreground">No active surveys in this community yet.</p>
        <Button asChild className="mt-4" size="sm" variant="outline">
          <Link to={ROUTES.allSurveys}>
            Browse all surveys <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </Card>
    ) : (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {surveys.map((survey) => (
          <SurveyCard
            key={survey.id}
            survey={survey}
            isSaved={isSaved(survey.id)}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
    )}
  </section>
);

const LeaderboardSection = ({ entries }: { entries: LeaderboardEntry[] }) => {
  return (
    <section className="mb-12 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight">Leaderboard</h2>
        <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
          Top contributors ranked by surveys completed in this community.
        </p>
      </div>

      {entries.length === 0 ? (
        <Card className="border-border/70 bg-gradient-to-b from-primary/[0.03] to-card shadow-sm p-8 text-center text-muted-foreground">
          No responses yet — be the first to participate in a survey from this community.
        </Card>
      ) : (
        <Card className="border-border/70 bg-gradient-to-b from-primary/[0.03] to-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[90px]">Rank</TableHead>
                <TableHead>Member</TableHead>
                <TableHead className="text-right">Surveys Completed</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.username}>
                  <TableCell className="font-semibold">
                    <span className="flex items-center gap-2">
                      {entry.rank <= 3 ? (
                        <Trophy
                          className="h-4 w-4 text-primary"
                          aria-hidden="true"
                        />
                      ) : null}
                      {entry.rank}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`}
                          alt={entry.name}
                        />
                        <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{entry.name}</div>
                        <div className="text-xs text-muted-foreground">@{entry.username}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    {entry.surveys_completed}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </section>
  );
};

const CommunityDetails = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [localSavedIds, setLocalSavedIds] = useState<Set<number>>(new Set());
  const [localFavouriteIds, setLocalFavouriteIds] = useState<Set<string>>(new Set());

  const communityQuery = useCommunityByIdQuery(communityId);
  const communitiesQuery = useCommunitiesQuery();
  const leaderboardQuery = useQuery({
    queryKey: ["community-leaderboard", communityId],
    queryFn: () => api.get<LeaderboardEntry[]>(`/communities/${communityId}/leaderboard`),
    enabled: !!communityId,
  });

  const publishedQ = useQuery({
    queryKey: ["published-surveys"],
    queryFn: () => api.get<ApiSurveySummary[]>("/surveys/published"),
  });

  const savedQ = useQuery({
    queryKey: ["saved-surveys"],
    queryFn: () => api.get<ApiSurveySummary[]>("/users/me/saved-surveys"),
  });

  const favouritesQ = useQuery({
    queryKey: ["favourite-communities"],
    queryFn: () => api.get<Array<{ id: string }>>("/users/me/favourite-communities"),
    enabled: isAuthenticated === true,
  });

  const savedIds = useMemo(
    () => new Set([...localSavedIds, ...(savedQ.data ?? []).map((s) => s.id)]),
    [localSavedIds, savedQ.data],
  );

  const favouriteIds = useMemo(
    () => new Set([...localFavouriteIds, ...(favouritesQ.data ?? []).map((c) => c.id)]),
    [localFavouriteIds, favouritesQ.data],
  );

  const handleJoin = async () => {
    if (!communityId || isJoining) return;
    setIsJoining(true);
    try {
      await apiCommunityRepository.join(communityId);
      await communityQuery.refetch();
      queryClient.invalidateQueries({ queryKey: ["joined-communities"] });
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!communityId || isLeaving) return;
    setIsLeaving(true);
    try {
      await apiCommunityRepository.leave(communityId);
      await communityQuery.refetch();
      queryClient.invalidateQueries({ queryKey: ["joined-communities"] });
    } catch {
      toast({ title: "Failed to leave community", variant: "destructive" });
    } finally {
      setIsLeaving(false);
    }
  };

  const handleToggleSave = async (surveyId: number) => {
    const isSaved = savedIds.has(surveyId);
    try {
      if (isSaved) {
        await api.delete(`/surveys/${surveyId}/save`);
        setLocalSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(surveyId);
          return next;
        });
        toast({ title: "Survey unsaved" });
      } else {
        await api.post(`/surveys/${surveyId}/save`);
        setLocalSavedIds((prev) => new Set(prev).add(surveyId));
        toast({ title: "Survey saved" });
      }
      queryClient.invalidateQueries({ queryKey: ["saved-surveys"] });
    } catch {
      toast({ title: "Failed to update saved status", variant: "destructive" });
    }
  };

  const handleToggleFavouriteCommunity = async (favCommunityId: string) => {
    const isFav = favouriteIds.has(favCommunityId);
    setLocalFavouriteIds((prev) => {
      const next = new Set(prev);
      if (isFav) { next.delete(favCommunityId); } else { next.add(favCommunityId); }
      return next;
    });
    try {
      if (isFav) {
        await api.delete(`/communities/${favCommunityId}/favourite`);
      } else {
        await api.post(`/communities/${favCommunityId}/favourite`);
      }
      queryClient.invalidateQueries({ queryKey: ["favourite-communities"] });
    } catch (err) {
      setLocalFavouriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) { next.add(favCommunityId); } else { next.delete(favCommunityId); }
        return next;
      });
      if (err instanceof Error && err.message === SESSION_EXPIRED) {
        throw err;
      }
      toast({ title: "Failed to update favourite", variant: "destructive" });
    }
  };

  const communityState = useMemo(() => queryToAsyncState(communityQuery), [communityQuery]);

  const activeSurveys = useMemo(
    () =>
      (publishedQ.data ?? [])
        .filter((s) => s.community_id === communityId)
        .slice(0, 4),
    [publishedQ.data, communityId],
  );

  const similarCommunities = useMemo(
    () =>
      communityQuery.data && communitiesQuery.data
        ? sortCommunities(
            communitiesQuery.data.filter((item) => item.id !== communityQuery.data?.id),
            "mostMembers",
          )
        : [],
    [communitiesQuery.data, communityQuery.data],
  );

  const handleExploreCommunity = (nextCommunityId: string) => {
    navigate(getCommunityRoute(nextCommunityId));
  };

  if (communityState.status === "loading") {
    return (
      <AppShell withContainer mainClassName="pb-14 pt-24">
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-5 w-4/5" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      </AppShell>
    );
  }

  if (communityState.status === "error") {
    return (
      <AppShell withContainer mainClassName="pb-14 pt-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Community unavailable</h1>
        <p className="mt-3 text-muted-foreground">{communityState.error}</p>
        <Button onClick={() => { communityQuery.refetch(); }} className="mt-8">
          Try again
        </Button>
      </AppShell>
    );
  }

  if (!communityQuery.data) {
    return (
      <AppShell withContainer mainClassName="pb-14 pt-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Community Not Found</h1>
        <p className="mt-3 text-muted-foreground">
          We couldn&apos;t find the community you&apos;re looking for.
        </p>
        <Button asChild className="mt-8">
          <Link to={ROUTES.communities}>Explore other communities</Link>
        </Button>
      </AppShell>
    );
  }

  return (
    <AppShell withContainer mainClassName="pb-14 pt-24">
      <CommunityOverview community={communityQuery.data} onJoin={handleJoin} onLeave={handleLeave} isJoining={isJoining} isLeaving={isLeaving} />
      <SurveysSection
        surveys={activeSurveys}
        isSaved={(id) => savedIds.has(id)}
        onToggleSave={handleToggleSave}
        communityId={communityId ?? ""}
      />
      <LeaderboardSection entries={leaderboardQuery.data ?? []} />

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">
            Similar Communities
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
            Explore adjacent topics with overlapping research interests.
          </p>
        </div>

        <PaginatedCommunityGrid
          communities={similarCommunities}
          onExplore={handleExploreCommunity}
          onFavourite={isAuthenticated ? handleToggleFavouriteCommunity : undefined}
          isFavourited={(id) => favouriteIds.has(id)}
          pageSize={6}
          className="rounded-xl border border-border/60 bg-gradient-to-b from-primary/[0.03] to-transparent p-4 sm:p-5"
        />
      </section>
    </AppShell>
  );
};

export default CommunityDetails;
