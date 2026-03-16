import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Activity, CalendarDays, FileText, Trophy, Users, UserPlus, Check } from "lucide-react";
import PaginatedCommunityGrid from "@/components/PaginatedCommunityGrid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import {
  sortCommunities,
  type Community,
} from "@/features/communities/domain/community-data";
import {
  useCommunitiesQuery,
  useCommunityByIdQuery,
} from "@/features/communities/hooks/use-communities-query";
import { apiCommunityRepository } from "@/features/communities/services/community-repository";
import { getCommunityRoute, ROUTES } from "@/lib/routes";
import { AppShell } from "@/shared/components/layout/AppShell";
import { queryToAsyncState } from "@/shared/lib/query-state";

interface Survey {
  id: string;
  title: string;
  description: string;
  participants: number;
  rewardLabel: string;
  deadlineDays: number;
}

interface LeaderboardEntry {
  username: string;
  name: string;
  surveys_completed: number;
  rank: number;
}

const buildSurveysForCommunity = (community: Community): Survey[] =>
  community.subcategories.slice(0, 3).map((subcategory, index) => ({
    id: `${community.id}-survey-${index + 1}`,
    title: `${subcategory} Pulse Study`,
    description:
      `Share your perspective on ${subcategory.toLowerCase()} trends in ` +
      `${community.name} and help shape the next research cycle.`,
    participants: Math.round(community.members * (0.18 + index * 0.05)),
    rewardLabel: `${10 + index * 5} Forge Points`,
    deadlineDays: 3 + index * 2,
  }));

const CommunityOverview = ({
  community,
  onJoin,
  isJoining,
}: {
  community: Community;
  onJoin: () => void;
  isJoining: boolean;
}) => {
  const Icon = community.icon;
  const joined = community.isMember;

  return (
    <section className="mb-12">
      <Card className="border-primary/15 bg-gradient-to-br from-primary/[0.06] via-card to-card p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {community.category}
                </p>
                <h1 className="bg-gradient-primary bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                  {community.name}
                </h1>
              </div>
            </div>

            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {community.longDescription}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {community.subcategories.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              <Button
                size="sm"
                variant={joined ? "outline" : "default"}
                className={joined ? "border-success/40 text-success" : "bg-gradient-primary shadow-elegant"}
                onClick={onJoin}
                disabled={joined || isJoining}
              >
                {joined ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Joined
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    {isJoining ? "Joining…" : "Join Community"}
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid w-full grid-cols-3 gap-3 lg:max-w-xs">
            <Card className="border-border/70 bg-background p-4 text-center shadow-sm">
              <Users className="mx-auto h-4 w-4 text-muted-foreground" />
              <p className="mt-2 text-lg font-semibold">
                {community.members.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Members</p>
            </Card>

            <Card className="border-border/70 bg-background p-4 text-center shadow-sm">
              <FileText className="mx-auto h-4 w-4 text-muted-foreground" />
              <p className="mt-2 text-lg font-semibold">
                {community.surveys.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Surveys</p>
            </Card>

            <Card className="border-border/70 bg-background p-4 text-center shadow-sm">
              <Activity className="mx-auto h-4 w-4 text-muted-foreground" />
              <p className="mt-2 text-lg font-semibold">
                {community.activityLevel}%
              </p>
              <p className="text-xs text-muted-foreground">Activity</p>
            </Card>
          </div>
        </div>
      </Card>
    </section>
  );
};

const SurveysSection = ({ surveys }: { surveys: Survey[] }) => (
  <section className="mb-12 space-y-6">
    <div className="space-y-2">
      <h2 className="text-3xl font-semibold tracking-tight">Active Surveys</h2>
      <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
        Participate in current studies and add your perspective to this
        community&apos;s active research stream.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {surveys.map((survey) => (
        <Card
          key={survey.id}
          className="border-border/70 bg-card p-6 shadow-sm transition-all duration-200 ease-out hover:border-primary/20 hover:shadow-md"
        >
          <h3 className="text-xl font-semibold tracking-tight">
            {survey.title}
          </h3>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
            {survey.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {survey.participants.toLocaleString()} participants
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {survey.deadlineDays} days left
            </span>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <Badge variant="secondary">{survey.rewardLabel}</Badge>
            <Button>Participate</Button>
          </div>
        </Card>
      ))}
    </div>
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
  const [isJoining, setIsJoining] = useState(false);

  const communityQuery = useCommunityByIdQuery(communityId);
  const communitiesQuery = useCommunitiesQuery();
  const leaderboardQuery = useQuery({
    queryKey: ["community-leaderboard", communityId],
    queryFn: () => api.get<LeaderboardEntry[]>(`/communities/${communityId}/leaderboard`),
    enabled: !!communityId,
  });

  const handleJoin = async () => {
    if (!communityId || isJoining) return;
    setIsJoining(true);
    try {
      await apiCommunityRepository.join(communityId);
      await communityQuery.refetch();
    } finally {
      setIsJoining(false);
    }
  };

  const communityState = useMemo(() => queryToAsyncState(communityQuery), [communityQuery]);

  const surveys = useMemo(
    () => (communityQuery.data ? buildSurveysForCommunity(communityQuery.data) : []),
    [communityQuery.data],
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
        <Button onClick={() => void communityQuery.refetch()} className="mt-8">
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
      <CommunityOverview community={communityQuery.data} onJoin={handleJoin} isJoining={isJoining} />
      <SurveysSection surveys={surveys} />
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
          pageSize={6}
          className="rounded-xl border border-border/60 bg-gradient-to-b from-primary/[0.03] to-transparent p-4 sm:p-5"
        />
      </section>
    </AppShell>
  );
};

export default CommunityDetails;
