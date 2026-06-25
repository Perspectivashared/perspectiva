import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Award, BarChart2, Building2, Calendar, Star, Trophy } from "lucide-react";
import { AppShell } from "@/shared/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ROUTES } from "@/lib/routes";

interface PublicProfileOut {
  username: string;
  name: string;
  category: string | null;
  sub_category: string | null;
  institution: string | null;
  points_balance: number;
  avg_rating: number | null;
  achievement_count: number;
  surveys_created: number;
  created_at: string;
}

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const { data: profile, isPending, isError } = useQuery({
    queryKey: queryKeys.publicProfile(username ?? ""),
    queryFn: () => api.get<PublicProfileOut>(`/users/${username}`),
    enabled: !!username,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  if (isPending) {
    return (
      <AppShell withContainer mainClassName="max-w-2xl pb-12 pt-24">
        <Card className="p-8 space-y-6 border-border/50 bg-card/50">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-4 w-40" />
        </Card>
      </AppShell>
    );
  }

  if (isError || !profile) {
    return (
      <AppShell withContainer mainClassName="max-w-2xl pb-12 pt-24">
        <Card className="p-8 text-center space-y-4 border-border/50 bg-card/50">
          <h1 className="text-2xl font-semibold">User not found</h1>
          <p className="text-muted-foreground">This profile doesn't exist or has been removed.</p>
          <Button onClick={() => navigate(ROUTES.forYou)}>Go Home</Button>
        </Card>
      </AppShell>
    );
  }

  const initials = profile.name.charAt(0).toUpperCase();

  return (
    <AppShell withContainer mainClassName="max-w-2xl pb-12 pt-24" backgroundClassName="bg-gradient-subtle">
      <Card className="p-8 space-y-8 border-border/50 bg-card/50 backdrop-blur">
        {/* Header */}
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-3xl font-bold text-primary">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
            </div>
            <p className="text-muted-foreground">@{profile.username}</p>
            {(profile.category || profile.sub_category) && (
              <p className="text-sm text-muted-foreground mt-1">
                {[profile.category, profile.sub_category].filter(Boolean).join(" · ")}
              </p>
            )}
            {profile.institution && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                {profile.institution}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-lg bg-muted/40 p-4 text-center space-y-1">
            <Trophy className="w-4 h-4 mx-auto text-primary" />
            <p className="text-2xl font-bold tabular-nums">{profile.points_balance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-4 text-center space-y-1">
            <Award className="w-4 h-4 mx-auto text-primary" />
            <p className="text-2xl font-bold tabular-nums">{profile.achievement_count}</p>
            <p className="text-xs text-muted-foreground">Achievements</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-4 text-center space-y-1">
            <BarChart2 className="w-4 h-4 mx-auto text-primary" />
            <p className="text-2xl font-bold tabular-nums">{profile.surveys_created}</p>
            <p className="text-xs text-muted-foreground">Surveys</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-4 text-center space-y-1">
            <Star className="w-4 h-4 mx-auto text-primary" />
            <p className="text-2xl font-bold tabular-nums">
              {profile.avg_rating != null ? profile.avg_rating.toFixed(1) : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border/40 pt-4">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            Member since{" "}
            {new Date(profile.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </Card>
    </AppShell>
  );
};

export default UserProfile;
