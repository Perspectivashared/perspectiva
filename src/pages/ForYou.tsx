import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SurveyListCard from "@/components/SurveyListCard";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ROUTES, getCommunityRoute, getSurveyEditRoute } from "@/lib/routes";
import {
  Search,
  Bookmark,
  ChevronDown,
  Star,
  Flame,
  Sparkles,
  CheckCircle2,
  FileEdit,
  Send,
  Building2,
  Heart,
  Play,
  AlertCircle,
  Telescope,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/shared/components/layout/AppShell";
import { api, SESSION_EXPIRED } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { browserSurveySessionStorage } from "@/features/surveys/services/survey-session-storage";
import { useCommunitiesQuery } from "@/features/communities/hooks/use-communities-query";
import CommunityCard from "@/components/CommunityCard";
import { SurveyCard, OwnedSurveyCard } from "@/components/SurveyCard";
import type { ApiSurveySummary } from "@/components/SurveyCard";
import type { Community } from "@/features/communities/domain/community-data";

// ─── Types ───────────────────────────────────────────────────────────────────

interface InProgressEntry {
  surveyId: string;
  title: string;
  updatedAt: string;
  answeredCount: number;
}

interface ApiUserProfile {
  category: string | null;
  sub_category: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const msAgo = (dateStr: string | null) =>
  dateStr ? Date.now() - new Date(dateStr).getTime() : Infinity;

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// ─── Sub-components ──────────────────────────────────────────────────────────

interface SectionShellProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  count: number;
  isEmpty: boolean;
  isLoading: boolean;
  isOpen: boolean;
  onToggle: () => void;
  emptyMessage: string;
  emptyAction?: { label: string; to: string };
  children: React.ReactNode;
}

const SectionShell = ({
  icon,
  title,
  count,
  isEmpty,
  isLoading,
  isOpen,
  onToggle,
  emptyMessage,
  emptyAction,
  children,
}: SectionShellProps) => {
  const [chevronDeg, setChevronDeg] = useState(isOpen ? 180 : 0);

  const handleOpenChange = () => {
    setChevronDeg((prev) => prev + 180);
    onToggle();
  };

  return (
  <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
    {/* Header — card lives only here */}
    <CollapsibleTrigger asChild>
      <button className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur shadow-sm hover:bg-card/90 hover:border-border hover:shadow-elegant transition-all duration-200 group">
        <div className="flex items-center gap-3">
          <span className="text-primary">{icon}</span>
          <h2 className="text-base font-semibold tracking-snug">{title}</h2>
          {isLoading ? (
            <Badge variant="outline" className="text-xs text-muted-foreground animate-pulse">
              loading…
            </Badge>
          ) : isEmpty ? (
            <Badge variant="outline" className="text-xs text-muted-foreground/50">
              empty
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs tabular-nums">
              {count}
            </Badge>
          )}
        </div>
        <ChevronDown
          className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform duration-300"
          style={{ transform: `rotate(${chevronDeg}deg)` }}
        />
      </button>
    </CollapsibleTrigger>

    {/* Content — no card, just indented rows */}
    <CollapsibleContent className="collapsible-animate">
      <div className="px-2 pt-3 pb-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-5 pl-1">Loading…</p>
        ) : isEmpty ? (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            {emptyAction && (
              <Button asChild variant="outline" size="sm">
                <Link to={emptyAction.to}>{emptyAction.label}</Link>
              </Button>
            )}
          </div>
        ) : (
          children
        )}
      </div>
    </CollapsibleContent>
  </Collapsible>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const ForYou = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Non-empty sections start open; empty sections start collapsed
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const isOpen = (id: string, isEmpty = false) =>
    id in openMap ? openMap[id] : !isEmpty;
  const toggle = (id: string, isEmpty = false) =>
    setOpenMap((prev) => ({ ...prev, [id]: !isOpen(id, isEmpty) }));

  // Local save-state (optimistic)
  const [localSavedIds, setLocalSavedIds] = useState<Set<number>>(new Set());

  // Local favourite-community state (optimistic — merged with server data below)
  const [localFavouriteIds, setLocalFavouriteIds] = useState<Set<string>>(new Set());

  // Search / filter / sort for "Browse All" section
  // ─── Queries ──────────────────────────────────────────────────────────────

  const publishedQ = useQuery({
    queryKey: ["published-surveys"],
    queryFn: () => api.get<ApiSurveySummary[]>("/surveys/published"),
  });

  const mySurveysQ = useQuery({
    queryKey: ["my-surveys"],
    queryFn: () => api.get<ApiSurveySummary[]>("/surveys/me"),
  });

  const completedQ = useQuery({
    queryKey: ["completed-surveys"],
    queryFn: () => api.get<ApiSurveySummary[]>("/users/me/completed-surveys"),
  });

  const savedQ = useQuery({
    queryKey: ["saved-surveys"],
    queryFn: () => api.get<ApiSurveySummary[]>("/users/me/saved-surveys"),
  });

  const profileQ = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => api.get<ApiUserProfile>("/users/me"),
  });

  const communitiesQ = useCommunitiesQuery();

  const favouritesQ = useQuery({
    queryKey: ["favourite-communities"],
    queryFn: () => api.get<Array<{ id: string }>>("/users/me/favourite-communities"),
  });

  // ─── Derived data ─────────────────────────────────────────────────────────

  const published = publishedQ.data ?? [];
  const mySurveys = mySurveysQ.data ?? [];
  const completed = completedQ.data ?? [];
  const savedSurveys = savedQ.data ?? [];
  const userCategory = profileQ.data?.category ?? null;
  const communities = communitiesQ.data ?? [];

  // Merged saved IDs (server + optimistic local)
  const savedIds = useMemo(
    () => new Set([...localSavedIds, ...savedSurveys.map((s) => s.id)]),
    [localSavedIds, savedSurveys],
  );

  // Merged favourite community IDs (server + optimistic local)
  const favouriteIds = useMemo(
    () => new Set([...localFavouriteIds, ...(favouritesQ.data ?? []).map((c) => c.id)]),
    [localFavouriteIds, favouritesQ.data],
  );

  // In-progress surveys from localStorage
  const inProgress = useMemo((): InProgressEntry[] => {
    const results: InProgressEntry[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith("survey-progress:")) continue;
        const surveyId = key.replace("survey-progress:", "");
        const stored = browserSurveySessionStorage.loadProgress(surveyId);
        if (!stored) continue;
        const match = published.find((s) => String(s.id) === surveyId);
        results.push({
          surveyId,
          title: match?.title ?? `Survey #${surveyId}`,
          updatedAt: stored.updatedAt,
          answeredCount: Object.keys(stored.answers).length,
        });
      }
    } catch {
      /* localStorage may be unavailable */
    }
    return results.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [published]);

  // Closing Soon — deadline within 7 days
  const closingSoon = useMemo(
    () =>
      published
        .filter(
          (s) =>
            s.deadline != null &&
            new Date(s.deadline).getTime() > Date.now() &&
            new Date(s.deadline).getTime() - Date.now() <= SEVEN_DAYS_MS,
        )
        .sort(
          (a, b) =>
            new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
        ),
    [published],
  );

  // Top Matches — surveys matching the user's category first, then by response count
  const topMatches = useMemo(() => {
    const sorted = [...published].sort((a, b) => {
      const aMatch = userCategory && a.category === userCategory ? 1 : 0;
      const bMatch = userCategory && b.category === userCategory ? 1 : 0;
      if (bMatch !== aMatch) return bMatch - aMatch;
      return b.response_count - a.response_count;
    });
    return sorted.slice(0, 6);
  }, [published, userCategory]);

  // New This Week — published within last 7 days
  const newThisWeek = useMemo(
    () =>
      published
        .filter((s) => msAgo(s.published_at) <= SEVEN_DAYS_MS)
        .sort((a, b) => msAgo(a.published_at) - msAgo(b.published_at)),
    [published],
  );

  // Trending Now — highest response counts
  const trending = useMemo(
    () =>
      [...published]
        .sort((a, b) => b.response_count - a.response_count)
        .slice(0, 8),
    [published],
  );

  // My published surveys
  const myPublished = useMemo(
    () =>
      mySurveys
        .filter((s) => s.status === "published")
        .sort(
          (a, b) =>
            new Date(b.published_at ?? b.created_at).getTime() -
            new Date(a.published_at ?? a.created_at).getTime(),
        )
        .slice(0, 6),
    [mySurveys],
  );

  // My draft surveys
  const myDrafts = useMemo(
    () => mySurveys.filter((s) => s.status === "draft"),
    [mySurveys],
  );

  // Recommended communities — sorted by activity level desc
  const recommendedCommunities = useMemo(
    () =>
      [...communities]
        .sort(
          (a, b) =>
            b.activityLevel - a.activityLevel ||
            b.activeSurveys - a.activeSurveys,
        )
        .slice(0, 6),
    [communities],
  );

  // Favourite communities — server-persisted + optimistic local
  const favouriteCommunities = useMemo(
    () => communities.filter((c) => favouriteIds.has(c.id)),
    [communities, favouriteIds],
  );

  // Surveys by user's category (for "Explore by Category" section)
  const categoryMatched = useMemo(
    () =>
      userCategory
        ? published.filter((s) => s.category === userCategory)
        : [],
    [published, userCategory],
  );

  // Newest published surveys — up to 6 shown in the Browse All section preview
  const newestPublished = useMemo(
    () =>
      [...published]
        .sort(
          (a, b) =>
            new Date(b.published_at ?? b.created_at).getTime() -
            new Date(a.published_at ?? a.created_at).getTime(),
        )
        .slice(0, 6),
    [published],
  );

  // ─── Toggle save ──────────────────────────────────────────────────────────

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
      // Keep server state in sync — the saved-surveys section reads from the
      // query cache, so invalidate it after every toggle.
      queryClient.invalidateQueries({ queryKey: ["saved-surveys"] });
    } catch {
      toast({
        title: "Failed to update saved status",
        variant: "destructive",
      });
    }
  };

  // ─── Toggle community favourite ───────────────────────────────────────────

  const handleToggleFavouriteCommunity = async (communityId: string) => {
    const isFav = favouriteIds.has(communityId);
    // Optimistic update
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
      // Revert optimistic update
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

  // ─── Section definitions ──────────────────────────────────────────────────

  type Section = {
    id: string;
    icon: React.ReactNode;
    title: string;
    count: number;
    isEmpty: boolean;
    isLoading: boolean;
    emptyMessage: string;
    emptyAction?: { label: string; to: string };
    content: React.ReactNode;
  };

  // Reusable grid wrappers
  const surveyGrid = (items: React.ReactNode) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{items}</div>
  );
  const communityGrid = (items: React.ReactNode) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{items}</div>
  );
  const rowList = (items: React.ReactNode) => (
    <div className="grid gap-3">{items}</div>
  );

  // Build sections and sort them inside a single useMemo so that JSX nodes
  // are only recreated when the underlying data actually changes — not on
  // every render triggered by unrelated state updates.
  const sortedSections = useMemo((): Section[] => {
    const sections: Section[] = [
      // ── 1. Closing Soon ────────────────────────────────────────────────────
      {
        id: "closing-soon",
        icon: <AlertCircle className="w-5 h-5" />,
        title: "Closing Soon",
        count: closingSoon.length,
        isEmpty: closingSoon.length === 0,
        isLoading: publishedQ.isPending,
        emptyMessage: "No surveys are closing in the next 7 days — check back soon!",
        content: surveyGrid(closingSoon.map((s) => (
          <SurveyCard
            key={s.id}
            survey={s}
            isSaved={savedIds.has(s.id)}
            onToggleSave={handleToggleSave}
            urgentDeadline
          />
        ))),
      },

      // ── 2. In Progress ─────────────────────────────────────────────────────
      {
        id: "in-progress",
        icon: <Play className="w-5 h-5" />,
        title: "In Progress",
        count: inProgress.length,
        isEmpty: inProgress.length === 0,
        isLoading: false,
        emptyMessage: "No surveys in progress. Find a survey and start answering!",
        emptyAction: { label: "Browse Surveys", to: ROUTES.forYou },
        content: rowList(inProgress.map((entry) => (
          <SurveyListCard
            key={entry.surveyId}
            title={entry.title}
            status="in-progress"
            date={entry.updatedAt}
            dateLabel="Updated"
            responseCount={entry.answeredCount}
            metricLabel="Questions answered"
            action={
              <Button
                asChild
                size="sm"
                className="bg-gradient-primary shadow-elegant hover:shadow-glow transition-all shrink-0"
              >
                <Link to={ROUTES.survey} state={{ surveyId: entry.surveyId, source: "for-you" }}>
                  Continue
                </Link>
              </Button>
            }
          />
        ))),
      },

      // ── 3. Top Matches ─────────────────────────────────────────────────────
      {
        id: "top-matches",
        icon: <Star className="w-5 h-5" />,
        title: "Top Matches",
        count: topMatches.length,
        isEmpty: topMatches.length === 0,
        isLoading: publishedQ.isPending,
        emptyMessage: "No matches yet. Update your profile to get personalised recommendations.",
        emptyAction: { label: "Update Profile", to: ROUTES.editProfile },
        content: surveyGrid(topMatches.map((s) => (
          <SurveyCard key={s.id} survey={s} isSaved={savedIds.has(s.id)} onToggleSave={handleToggleSave} />
        ))),
      },

      // ── 4. New This Week ───────────────────────────────────────────────────
      {
        id: "new-this-week",
        icon: <Sparkles className="w-5 h-5" />,
        title: "New This Week",
        count: newThisWeek.length,
        isEmpty: newThisWeek.length === 0,
        isLoading: publishedQ.isPending,
        emptyMessage: "No new surveys this week — check back soon!",
        content: surveyGrid(newThisWeek.map((s) => (
          <SurveyCard key={s.id} survey={s} isSaved={savedIds.has(s.id)} onToggleSave={handleToggleSave} />
        ))),
      },

      // ── 5. Trending Now ────────────────────────────────────────────────────
      {
        id: "trending",
        icon: <Flame className="w-5 h-5" />,
        title: "Trending Now",
        count: trending.length,
        isEmpty: trending.length === 0,
        isLoading: publishedQ.isPending,
        emptyMessage: "No trending surveys yet.",
        content: surveyGrid(trending.map((s) => (
          <SurveyCard key={s.id} survey={s} isSaved={savedIds.has(s.id)} onToggleSave={handleToggleSave} />
        ))),
      },

      // ── 6. Saved Surveys ───────────────────────────────────────────────────
      {
        id: "saved",
        icon: <Bookmark className="w-5 h-5" />,
        title: "Saved Surveys",
        count: savedSurveys.length,
        isEmpty: savedSurveys.length === 0,
        isLoading: savedQ.isPending,
        emptyMessage: "No saved surveys. Bookmark any survey to quickly find it here.",
        emptyAction: { label: "Browse Surveys", to: ROUTES.forYou },
        content: surveyGrid(savedSurveys.map((s) => (
          <SurveyCard key={s.id} survey={s} isSaved onToggleSave={handleToggleSave} />
        ))),
      },

      // ── 7. Recently Answered ───────────────────────────────────────────────
      {
        id: "recently-answered",
        icon: <CheckCircle2 className="w-5 h-5" />,
        title: "Recently Answered Surveys",
        count: completed.length,
        isEmpty: completed.length === 0,
        isLoading: completedQ.isPending,
        emptyMessage: "You haven't answered any surveys yet. Take your first one today!",
        emptyAction: { label: "Find Surveys", to: ROUTES.forYou },
        content: rowList(completed.slice(0, 6).map((s) => (
          <SurveyListCard
            key={s.id}
            title={s.title}
            status="completed"
            category={s.category}
            date={s.published_at ?? s.created_at}
            dateLabel="Published"
            responseCount={s.response_count}
            metricLabel="Total responses"
          />
        ))),
      },

      // ── 8. Recently Published by You ───────────────────────────────────────
      {
        id: "my-published",
        icon: <Send className="w-5 h-5" />,
        title: "Recently Published by You",
        count: myPublished.length,
        isEmpty: myPublished.length === 0,
        isLoading: mySurveysQ.isPending,
        emptyMessage: "You haven't published any surveys yet. Create one to share with the community.",
        emptyAction: { label: "Create Survey", to: ROUTES.createSurvey },
        content: surveyGrid(myPublished.map((s) => (
          <OwnedSurveyCard key={s.id} survey={s} />
        ))),
      },

      // ── 9. Draft Surveys ───────────────────────────────────────────────────
      {
        id: "drafts",
        icon: <FileEdit className="w-5 h-5" />,
        title: "Draft Surveys Created by You",
        count: myDrafts.length,
        isEmpty: myDrafts.length === 0,
        isLoading: mySurveysQ.isPending,
        emptyMessage: "No drafts yet. Start building your first survey!",
        emptyAction: { label: "Create Survey", to: ROUTES.createSurvey },
        content: rowList(myDrafts.map((s) => (
          <SurveyListCard
            key={s.id}
            title={s.title || "Untitled Survey"}
            status="draft"
            category={s.category}
            date={s.created_at}
            dateLabel="Created"
            action={
              <Button asChild variant="outline" size="sm">
                <Link to={getSurveyEditRoute(String(s.id))}>Edit Draft</Link>
              </Button>
            }
          />
        ))),
      },

      // ── 10. Favourite Communities ──────────────────────────────────────────
      {
        id: "favourite-communities",
        icon: <Heart className="w-5 h-5" />,
        title: "Favourite Communities",
        count: favouriteCommunities.length,
        isEmpty: favouriteCommunities.length === 0,
        isLoading: communitiesQ.isPending || favouritesQ.isPending,
        emptyMessage: "No favourited communities yet. Explore communities and join ones that interest you.",
        emptyAction: { label: "Explore Communities", to: ROUTES.communities },
        content: communityGrid(favouriteCommunities.map((c) => (
          <CommunityCard
            key={c.id}
            community={c}
            onExplore={(id) => navigate(getCommunityRoute(id))}
            onFavourite={handleToggleFavouriteCommunity}
            isFavourited={favouriteIds.has(c.id)}
          />
        ))),
      },

      // ── 11. Recommended Communities ────────────────────────────────────────
      {
        id: "recommended-communities",
        icon: <Building2 className="w-5 h-5" />,
        title: "Recommended Communities",
        count: recommendedCommunities.length,
        isEmpty: recommendedCommunities.length === 0,
        isLoading: communitiesQ.isPending,
        emptyMessage: "No communities available yet.",
        emptyAction: { label: "Browse Communities", to: ROUTES.communities },
        content: communityGrid(recommendedCommunities.map((c) => (
          <CommunityCard
            key={c.id}
            community={c}
            onExplore={(id) => navigate(getCommunityRoute(id))}
            onFavourite={handleToggleFavouriteCommunity}
            isFavourited={favouriteIds.has(c.id)}
          />
        ))),
      },

      // ── 12. Explore by Your Category ───────────────────────────────────────
      {
        id: "by-category",
        icon: <Telescope className="w-5 h-5" />,
        title: userCategory ? `Surveys in ${userCategory}` : "Explore by Category",
        count: categoryMatched.length,
        isEmpty: categoryMatched.length === 0,
        isLoading: publishedQ.isPending || profileQ.isPending,
        emptyMessage: userCategory
          ? `No surveys in ${userCategory} yet. Check back soon or explore other categories.`
          : "Set your profile category to see surveys tailored to your field.",
        emptyAction: !userCategory ? { label: "Update Profile", to: ROUTES.editProfile } : undefined,
        content: surveyGrid(categoryMatched.map((s) => (
          <SurveyCard key={s.id} survey={s} isSaved={savedIds.has(s.id)} onToggleSave={handleToggleSave} />
        ))),
      },

      // ── 13. Browse All Surveys ─────────────────────────────────────────────
      {
        id: "browse-all",
        icon: <Search className="w-5 h-5" />,
        title: "Browse All Surveys",
        count: published.length,
        isEmpty: published.length === 0 && !publishedQ.isPending,
        isLoading: publishedQ.isPending,
        emptyMessage: "No surveys available yet. Be the first to create one!",
        emptyAction: { label: "Create Survey", to: ROUTES.createSurvey },
        content: (
          <>
            {surveyGrid(newestPublished.map((s) => (
              <SurveyCard key={s.id} survey={s} isSaved={savedIds.has(s.id)} onToggleSave={handleToggleSave} />
            )))}
            <div className="flex justify-center pt-3">
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link to={ROUTES.allSurveys}>
                  Browse all surveys <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </>
        ),
      },
    ];

    const filled = sections.filter((s) => !s.isEmpty || s.isLoading);
    const empty = sections.filter((s) => s.isEmpty && !s.isLoading);
    return [...filled, ...empty];
  }, [
    closingSoon, inProgress, topMatches, newThisWeek, trending,
    savedSurveys, completed, myPublished, myDrafts,
    favouriteCommunities, recommendedCommunities, categoryMatched,
    published, newestPublished, savedIds, favouriteIds,
    userCategory, publishedQ.isPending, mySurveysQ.isPending,
    completedQ.isPending, savedQ.isPending, communitiesQ.isPending, profileQ.isPending,
    favouritesQ.isPending, handleToggleSave, handleToggleFavouriteCommunity, navigate,
  ]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AppShell
      withContainer
      mainClassName="px-4 pb-16 pt-24"
      backgroundClassName="bg-background"
    >
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            For You
          </span>
        </h1>
        <p className="text-muted-foreground text-base">
          Surveys matched to your interests and expertise
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sortedSections.map((section) => (
          <SectionShell
            key={section.id}
            id={section.id}
            icon={section.icon}
            title={section.title}
            count={section.count}
            isEmpty={section.isEmpty}
            isLoading={section.isLoading}
            isOpen={isOpen(section.id, section.isEmpty)}
            onToggle={() => toggle(section.id, section.isEmpty)}
            emptyMessage={section.emptyMessage}
            emptyAction={section.emptyAction}
          >
            {section.content}
          </SectionShell>
        ))}
      </div>
    </AppShell>
  );
};

export default ForYou;
