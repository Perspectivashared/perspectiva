import CommunityCard from "@/components/CommunityCard";
import SurveyListCard from "@/components/SurveyListCard";
import BuyCoinsIconLink from "@/components/pricing/BuyCoinsIconLink";
import CoinBalancePill from "@/components/pricing/CoinBalancePill";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Star,
  TrendingUp,
  FileText,
  Users,
  Award,
  Target,
  Zap,
  Coins,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Bookmark,
  BookmarkCheck,
  Heart,
  Code2,
  Briefcase,
  Dumbbell,
  Microscope,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Trash2, FolderOpen, Loader2 } from "lucide-react";
import type { SurveyBuilderQuestionType } from "@/features/survey-builder/domain/types";
import {
  defaultProfile,
  fetchUserProfile,
} from "@/features/profile/services/profile-service";
import { AppShell } from "@/shared/components/layout/AppShell";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES, getCommunityRoute } from "@/lib/routes";

interface ApiSurveySummary {
  id: number;
  title: string;
  category: string | null;
  status: string;
  response_count: number;
  target_responses: number | null;
  published_at: string | null;
  created_at: string;
}

interface ApiCommunitySummary {
  id: string;
  name: string;
  description: string;
  category: string;
  icon_name: string;
  member_count: number;
  survey_count: number;
  active_survey_count: number;
}

interface ApiAchievement {
  id: number;
  key: string;
  name: string;
  description: string;
  icon_name: string;
  category: "survey" | "engagement" | "community" | "milestone" | "gamification";
  points_reward: number;
  coins_reward: number;
  unlocked_at: string;
}

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  trophy: Trophy,
  star: Star,
  target: Target,
  zap: Zap,
  users: Users,
  award: Award,
  sparkles: Sparkles,
  "trending-up": TrendingUp,
  coins: Coins,
  "file-text": FileText,
};

const CATEGORY_GRADIENT: Record<ApiAchievement["category"], string> = {
  survey:       "from-yellow-500 to-amber-500",
  engagement:   "from-purple-500 to-pink-500",
  community:    "from-blue-500 to-cyan-500",
  milestone:    "from-green-500 to-emerald-500",
  gamification: "from-orange-500 to-red-500",
};

const COMMUNITY_ICONS: Record<string, LucideIcon> = {
  code2: Code2,
  "trending-up": TrendingUp,
  briefcase: Briefcase,
  dumbbell: Dumbbell,
  microscope: Microscope,
  "book-open": BookOpen,
  users: Users,
  star: Star,
  zap: Zap,
};


const Profile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [createdOpenMap, setCreatedOpenMap] = useState<Record<string, boolean>>({});
  const [createdChevronDeg, setCreatedChevronDeg] = useState<Record<string, number>>({});
  const isCreatedOpen = (id: string, isEmpty: boolean) =>
    id in createdOpenMap ? createdOpenMap[id] : !isEmpty;
  const getChevronDeg = (id: string, isEmpty: boolean) =>
    id in createdChevronDeg ? createdChevronDeg[id] : (isCreatedOpen(id, isEmpty) ? 180 : 0);
  const toggleCreated = (id: string, isEmpty: boolean) => {
    const currentDeg = getChevronDeg(id, isEmpty);
    setCreatedOpenMap((prev) => ({ ...prev, [id]: !isCreatedOpen(id, isEmpty) }));
    setCreatedChevronDeg((prev) => ({ ...prev, [id]: currentDeg + 180 }));
  };

  const [completedOpenMap, setCompletedOpenMap] = useState<Record<string, boolean>>({});
  const [completedChevronDeg, setCompletedChevronDeg] = useState<Record<string, number>>({});
  const isCompletedOpen = (id: string, isEmpty: boolean) =>
    id in completedOpenMap ? completedOpenMap[id] : !isEmpty;
  const getCompletedChevronDeg = (id: string, isEmpty: boolean) =>
    id in completedChevronDeg ? completedChevronDeg[id] : (isCompletedOpen(id, isEmpty) ? 180 : 0);
  const toggleCompleted = (id: string, isEmpty: boolean) => {
    const currentDeg = getCompletedChevronDeg(id, isEmpty);
    setCompletedOpenMap((prev) => ({ ...prev, [id]: !isCompletedOpen(id, isEmpty) }));
    setCompletedChevronDeg((prev) => ({ ...prev, [id]: currentDeg + 180 }));
  };

  const [bookmarksOpenMap, setBookmarksOpenMap] = useState<Record<string, boolean>>({});
  const [bookmarksChevronDeg, setBookmarksChevronDeg] = useState<Record<string, number>>({});
  const isBookmarksOpen = (id: string, isEmpty: boolean) =>
    id in bookmarksOpenMap ? bookmarksOpenMap[id] : !isEmpty;
  const getBookmarksChevronDeg = (id: string, isEmpty: boolean) =>
    id in bookmarksChevronDeg ? bookmarksChevronDeg[id] : (isBookmarksOpen(id, isEmpty) ? 180 : 0);
  const toggleBookmarks = (id: string, isEmpty: boolean) => {
    const currentDeg = getBookmarksChevronDeg(id, isEmpty);
    setBookmarksOpenMap((prev) => ({ ...prev, [id]: !isBookmarksOpen(id, isEmpty) }));
    setBookmarksChevronDeg((prev) => ({ ...prev, [id]: currentDeg + 180 }));
  };

  const loadDraft = async (surveyId: number) => {
    setLoadingId(surveyId);
    try {
      const survey = await api.get<any>(`/surveys/${surveyId}`);
      navigate("/create-survey", {
        state: {
          draftId: survey.id,
          surveyTitle: survey.title,
          surveyDescription: survey.description,
          category: survey.category,
          targetResponses: survey.target_responses,
          deadline: survey.deadline ? survey.deadline.split("T")[0] : "",
          questions: survey.questions
            .sort((a: any, b: any) => a.order - b.order)
            .map((q: any) => ({
              question: q.question_text,
              type: q.question_type as SurveyBuilderQuestionType,
              required: q.required,
              options: q.options.map((o: any) => ({ text: o.text })),
            })),
        },
      });
    } catch {
      toast({ title: "Failed to load draft", variant: "destructive" });
    } finally {
      setLoadingId(null);
    }
  };

  const deleteDraft = async (surveyId: number) => {
    setDeletingId(surveyId);
    try {
      await api.delete(`/surveys/${surveyId}`);
      await queryClient.invalidateQueries({ queryKey: ["my-surveys"] });
      toast({ title: "Draft deleted" });
    } catch (err) {
      toast({
        title: "Failed to delete draft",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: fetchUserProfile,
  });
  const surveysQuery = useQuery({
    queryKey: ["my-surveys"],
    queryFn: () => api.get<ApiSurveySummary[]>("/surveys/me"),
  });
  const savedQuery = useQuery({
    queryKey: ["saved-surveys"],
    queryFn: () => api.get<ApiSurveySummary[]>("/users/me/saved-surveys"),
  });
  const completedQuery = useQuery({
    queryKey: ["completed-surveys"],
    queryFn: () => api.get<ApiSurveySummary[]>("/users/me/completed-surveys"),
  });
  const inProgressQuery = useQuery({
    queryKey: ["in-progress-surveys"],
    queryFn: () => api.get<ApiSurveySummary[]>("/users/me/in-progress-surveys"),
  });
  const favouriteCommunitiesQuery = useQuery({
    queryKey: ["favourite-communities"],
    queryFn: () => api.get<ApiCommunitySummary[]>("/users/me/favourite-communities"),
  });
  const achievementsQuery = useQuery({
    queryKey: ["my-achievements"],
    queryFn: () => api.get<ApiAchievement[]>("/users/me/achievements"),
  });
  const user = profileQuery.data ?? defaultProfile;

  const savedIds = new Set((savedQuery.data ?? []).map((s) => s.id));

  const handleToggleSave = async (surveyId: number) => {
    const isSaved = savedIds.has(surveyId);
    try {
      if (isSaved) {
        await api.delete(`/surveys/${surveyId}/save`);
      } else {
        await api.post(`/surveys/${surveyId}/save`);
      }
      await queryClient.invalidateQueries({ queryKey: ["saved-surveys"] });
      toast({ title: isSaved ? "Survey unsaved" : "Survey saved" });
    } catch {
      toast({ title: "Failed to update saved status", variant: "destructive" });
    }
  };

  if (profileQuery.isPending) {
    return (
      <AppShell
        withContainer
        mainClassName="flex min-h-[60vh] max-w-6xl items-center justify-center px-4 pb-12 pt-24"
        backgroundClassName="bg-gradient-subtle"
      >
        <div className="flex animate-pulse flex-col items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-primary/10" />
          <div className="h-8 w-48 rounded bg-primary/10" />
          <div className="h-4 w-32 rounded bg-primary/10" />
        </div>
      </AppShell>
    );
  }

  if (profileQuery.isError) {
    return (
      <AppShell
        withContainer
        mainClassName="flex min-h-[60vh] max-w-6xl items-center justify-center px-4 pb-12 pt-24"
        backgroundClassName="bg-gradient-subtle"
      >
        <div className="text-center text-destructive">
          <p className="font-semibold">Failed to load profile</p>
          <p className="text-sm text-muted-foreground mt-1">{profileQuery.error?.message}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      withContainer
      mainClassName="max-w-6xl px-4 pb-12 pt-24"
      backgroundClassName="bg-gradient-subtle"
    >
        {/* Profile Header */}
        <Card className="p-8 mb-8 border-border/50 bg-card/50 backdrop-blur">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="w-24 h-24 border-4 border-primary/20">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || "user"}`} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                  <p className="text-muted-foreground mb-3">
                    {user.role}{user.institution ? ` • ${user.institution}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.isAdmin && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 transition-all hover:bg-primary/10 hover:text-[hsl(195_85%_28%)] hover:border-primary/50 hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.2)]">
                        Admin
                      </Badge>
                    )}
                    {user.category && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 transition-all hover:bg-primary/10 hover:text-[hsl(195_85%_28%)] hover:border-primary/50 hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.2)]">
                        {user.category}
                      </Badge>
                    )}
                    {user.subCategory && (
                      <Badge className="bg-accent/10 text-accent border-accent/20 transition-all hover:bg-accent/10 hover:text-[hsl(185_75%_32%)] hover:border-accent/50 hover:shadow-[0_0_0_3px_hsl(var(--accent)/0.2)]">
                        {user.subCategory}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className="h-9 px-4 border-primary/30"
                  >
                    <Sparkles className="w-4 h-4 mr-2 text-primary" />
                    <span className="font-bold text-base text-primary">
                      {user.points}
                    </span>
                  </Badge>
                  <CoinBalancePill
                    coins={user.coins}
                    showBuyAction
                    className="h-9 border-yellow-500/30 bg-yellow-500/10 py-1"
                  />
                  <Button asChild variant="outline" size="sm">
                    <Link to={ROUTES.editProfile}>Edit Profile</Link>
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 rounded-lg bg-accent/5 border border-accent/10">
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-2xl font-bold text-accent">
                    {user.surveysCompleted}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Surveys Completed
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-success/5 border border-success/10">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-success" />
                  </div>
                  <div className="text-2xl font-bold text-success">
                    {user.surveysCreated}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Surveys Created
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {user.avgRating}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg Rating
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Activity Tabs */}
            <Tabs defaultValue="wallet" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="created">Created Surveys</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="saved">Bookmarks</TabsTrigger>
                <TabsTrigger value="wallet">Wallet</TabsTrigger>
              </TabsList>

              <TabsContent value="created" className="space-y-3 mt-6">
                {surveysQuery.isPending ? (
                  <p className="text-muted-foreground text-sm">Loading surveys...</p>
                ) : (() => {
                  const active  = surveysQuery.data?.filter((s) => s.status === "published") ?? [];
                  const closed  = surveysQuery.data?.filter((s) => s.status === "closed")    ?? [];
                  const drafts  = surveysQuery.data?.filter((s) => s.status === "draft")     ?? [];

                  const renderSurveyCard = (survey: ApiSurveySummary) => {
                    const cardStatus = survey.status === "published" ? "active" : survey.status === "closed" ? "closed" : "draft";
                    const action = survey.status === "draft" ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={loadingId === survey.id}
                          onClick={() => loadDraft(survey.id)}
                        >
                          {loadingId === survey.id ? (
                            <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Loading...</>
                          ) : (
                            <><FolderOpen className="h-3.5 w-3.5 mr-1" />Load</>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          disabled={deletingId === survey.id}
                          onClick={() => deleteDraft(survey.id)}
                        >
                          {deletingId === survey.id ? (
                            <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Deleting...</>
                          ) : (
                            <><Trash2 className="h-3.5 w-3.5 mr-1" />Delete</>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/surveys/${survey.id}/analytics`}>View Results</Link>
                      </Button>
                    );
                    return (
                      <SurveyListCard
                        key={survey.id}
                        title={survey.title || "Untitled Survey"}
                        status={cardStatus}
                        category={survey.category}
                        date={survey.created_at}
                        responseCount={survey.response_count}
                        targetResponses={survey.target_responses}
                        action={action}
                      />
                    );
                  };

                  const sections = [
                    { id: "active", label: "Active Surveys",  icon: <FileText className="w-4 h-4" />, items: active },
                    { id: "closed", label: "Closed Surveys",  icon: <Trophy   className="w-4 h-4" />, items: closed },
                    { id: "drafts", label: "Drafts",          icon: <FolderOpen className="w-4 h-4" />, items: drafts },
                  ];

                  return sections.map(({ id, label, icon, items }) => {
                    const isEmpty = items.length === 0;
                    const open = isCreatedOpen(id, isEmpty);
                    return (
                      <Collapsible key={id} open={open} onOpenChange={() => toggleCreated(id, isEmpty)}>
                        <CollapsibleTrigger asChild>
                          <button className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur shadow-sm hover:bg-card/90 hover:border-border hover:shadow-elegant transition-all duration-200 group">
                            <div className="flex items-center gap-3">
                              <span className="text-primary">{icon}</span>
                              <h2 className="text-base font-semibold">{label}</h2>
                              {isEmpty ? (
                                <Badge variant="outline" className="text-xs text-muted-foreground/50">empty</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs tabular-nums">{items.length}</Badge>
                              )}
                            </div>
                            <ChevronDown
                              className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform duration-300"
                              style={{ transform: `rotate(${getChevronDeg(id, isEmpty)}deg)` }}
                            />
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="collapsible-animate">
                          <div className="px-2 pt-3 pb-1">
                            {isEmpty ? (
                              <p className="text-sm text-muted-foreground py-5 pl-1">No {label.toLowerCase()} yet.</p>
                            ) : (
                              <div className="space-y-4">{items.map(renderSurveyCard)}</div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  });
                })()}
              </TabsContent>

              <TabsContent value="completed" className="space-y-3 mt-6">
                {(completedQuery.isPending || inProgressQuery.isPending) ? (
                  <p className="text-muted-foreground text-sm">Loading surveys...</p>
                ) : (() => {
                  const completed = completedQuery.data ?? [];
                  const inProgress = inProgressQuery.data ?? [];

                  const renderCompletedCard = (survey: ApiSurveySummary) => (
                    <SurveyListCard
                      key={survey.id}
                      title={survey.title || "Untitled Survey"}
                      status="completed"
                      category={survey.category}
                      date={survey.published_at ?? survey.created_at}
                      dateLabel="Published"
                      responseCount={survey.response_count}
                      metricLabel="Total responses"
                    />
                  );

                  const renderInProgressCard = (survey: ApiSurveySummary) => (
                    <SurveyListCard
                      key={survey.id}
                      title={survey.title || "Untitled Survey"}
                      status="in-progress"
                      category={survey.category}
                      date={survey.published_at ?? survey.created_at}
                      dateLabel="Published"
                      responseCount={survey.response_count}
                      targetResponses={survey.target_responses}
                      action={
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleSave(survey.id)}
                            title={savedIds.has(survey.id) ? "Unsave" : "Save"}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                          >
                            {savedIds.has(survey.id)
                              ? <BookmarkCheck className="h-4 w-4 fill-primary text-primary" />
                              : <Bookmark className="h-4 w-4" />
                            }
                          </button>
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/surveys/${survey.id}`}>Take Survey</Link>
                          </Button>
                        </>
                      }
                    />
                  );

                  const sections = [
                    { id: "completed", label: "Completed Surveys", icon: <Trophy className="w-4 h-4" />, items: completed, renderCard: renderCompletedCard },
                    { id: "in-progress", label: "Surveys In Progress", icon: <Zap className="w-4 h-4" />, items: inProgress, renderCard: renderInProgressCard },
                  ];

                  return (
                    <>
                      {sections.map(({ id, label, icon, items, renderCard }) => {
                        const isEmpty = items.length === 0;
                        const open = isCompletedOpen(id, isEmpty);
                        return (
                          <Collapsible key={id} open={open} onOpenChange={() => toggleCompleted(id, isEmpty)}>
                            <CollapsibleTrigger asChild>
                              <button className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur shadow-sm hover:bg-card/90 hover:border-border hover:shadow-elegant transition-all duration-200 group">
                                <div className="flex items-center gap-3">
                                  <span className="text-primary">{icon}</span>
                                  <h2 className="text-base font-semibold">{label}</h2>
                                  {isEmpty ? (
                                    <Badge variant="outline" className="text-xs text-muted-foreground/50">empty</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs tabular-nums">{items.length}</Badge>
                                  )}
                                </div>
                                <ChevronDown
                                  className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform duration-300"
                                  style={{ transform: `rotate(${getCompletedChevronDeg(id, isEmpty)}deg)` }}
                                />
                              </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="collapsible-animate">
                              <div className="px-2 pt-3 pb-1">
                                {isEmpty ? (
                                  <p className="text-sm text-muted-foreground py-5 pl-1">No {label.toLowerCase()} yet.</p>
                                ) : (
                                  <div className="space-y-4">{items.map(renderCard)}</div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                      <div className="pt-1 text-center">
                        <Link
                          to={ROUTES.forYou}
                          className="primary-nav-link text-sm font-bold text-primary"
                        >
                          Let's explore surveys →
                        </Link>
                      </div>
                    </>
                  );
                })()}
              </TabsContent>

              <TabsContent value="saved" className="space-y-3 mt-6">
                {(() => {
                  const savedSurveys = savedQuery.data ?? [];
                  const favouriteCommunities = favouriteCommunitiesQuery.data ?? [];

                  const renderSavedSurveyCard = (survey: ApiSurveySummary) => {
                    const cardStatus = survey.status === "published" ? "active" : survey.status === "closed" ? "closed" : "draft";
                    return (
                      <SurveyListCard
                        key={survey.id}
                        title={survey.title || "Untitled Survey"}
                        status={cardStatus}
                        category={survey.category}
                        date={survey.created_at}
                        responseCount={survey.response_count}
                        targetResponses={survey.target_responses}
                        action={
                          <button
                            type="button"
                            onClick={() => handleToggleSave(survey.id)}
                            title={savedIds.has(survey.id) ? "Unsave" : "Save"}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                          >
                            {savedIds.has(survey.id)
                              ? <BookmarkCheck className="h-4 w-4 fill-primary text-primary" />
                              : <Bookmark className="h-4 w-4" />
                            }
                          </button>
                        }
                      />
                    );
                  };

                  const handleUnfavouriteCommunity = async (communityId: string) => {
                    try {
                      await api.delete(`/communities/${communityId}/favourite`);
                      await queryClient.invalidateQueries({ queryKey: ["favourite-communities"] });
                      toast({ title: "Removed from favourites" });
                    } catch {
                      toast({ title: "Failed to update favourite", variant: "destructive" });
                    }
                  };

                  const renderCommunityCard = (community: ApiCommunitySummary) => (
                    <CommunityCard
                      key={community.id}
                      community={{
                        id: community.id,
                        name: community.name,
                        description: community.description,
                        icon: COMMUNITY_ICONS[community.icon_name] ?? Users,
                        members: community.member_count,
                        surveys: community.survey_count,
                        activeSurveys: community.active_survey_count,
                        category: community.category,
                      }}
                      onExplore={(id) => navigate(getCommunityRoute(id))}
                      onFavourite={handleUnfavouriteCommunity}
                      isFavourited
                    />
                  );

                  const sections = [
                    {
                      id: "saved-surveys",
                      label: "Saved Surveys",
                      icon: <Bookmark className="w-4 h-4" />,
                      items: savedSurveys,
                      isLoading: savedQuery.isPending,
                      renderCard: renderSavedSurveyCard,
                    },
                    {
                      id: "favourite-communities",
                      label: "Favourited Communities",
                      icon: <Heart className="w-4 h-4" />,
                      items: favouriteCommunities,
                      isLoading: favouriteCommunitiesQuery.isPending,
                      renderCard: renderCommunityCard,
                      containerClassName: "grid grid-cols-1 gap-6",
                    },
                  ];

                  return sections.map(({ id, label, icon, items, isLoading, renderCard, containerClassName }) => {
                    const isEmpty = !isLoading && items.length === 0;
                    const open = isBookmarksOpen(id, isEmpty);
                    return (
                      <Collapsible key={id} open={open} onOpenChange={() => toggleBookmarks(id, isEmpty)}>
                        <CollapsibleTrigger asChild>
                          <button className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-border/60 bg-card/60 backdrop-blur shadow-sm hover:bg-card/90 hover:border-border hover:shadow-elegant transition-all duration-200 group">
                            <div className="flex items-center gap-3">
                              <span className="text-primary">{icon}</span>
                              <h2 className="text-base font-semibold">{label}</h2>
                              {isLoading ? (
                                <Badge variant="outline" className="text-xs text-muted-foreground/50">loading</Badge>
                              ) : isEmpty ? (
                                <Badge variant="outline" className="text-xs text-muted-foreground/50">empty</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs tabular-nums">{items.length}</Badge>
                              )}
                            </div>
                            <ChevronDown
                              className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform duration-300"
                              style={{ transform: `rotate(${getBookmarksChevronDeg(id, isEmpty)}deg)` }}
                            />
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="collapsible-animate">
                          <div className="px-2 pt-3 pb-1">
                            {isLoading ? (
                              <p className="text-sm text-muted-foreground py-5 pl-1">Loading...</p>
                            ) : isEmpty ? (
                              <p className="text-sm text-muted-foreground py-5 pl-1">No {label.toLowerCase()} yet.</p>
                            ) : (
                              <div className={containerClassName ?? "space-y-4"}>{items.map((item: any) => renderCard(item))}</div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  });
                })()}
              </TabsContent>

              <TabsContent value="wallet" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Total Points
                        </p>
                        <h3 className="text-3xl font-bold text-primary">
                          {user.points}
                        </h3>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Sparkles className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                      <span className="text-green-500 font-medium">
                        +12%
                      </span>{" "}
                      from last month
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-500/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Total Coins
                        </p>
                        <h3 className="text-3xl font-bold text-yellow-600">
                          {user.coins}
                        </h3>
                      </div>
                      <div className="relative">
                        <div className="p-3 bg-yellow-500/10 rounded-xl">
                          <Coins className="w-6 h-6 text-yellow-600" />
                        </div>
                        <BuyCoinsIconLink className="absolute -right-2 -top-2 h-6 w-6 border-yellow-500/40 bg-background p-0" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                      <span className="text-green-500 font-medium">
                        +5%
                      </span>{" "}
                      from last month
                    </div>
                  </Card>
                </div>

                <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
                  <h3 className="font-semibold mb-4">Transaction History</h3>
                  <div className="space-y-4">
                    {user.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2 rounded-full ${transaction.type === "earn" ? "bg-green-500/10" : "bg-red-500/10"}`}
                          >
                            {transaction.type === "earn" ? (
                              <ArrowUpRight className="w-4 h-4 text-green-500" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`font-bold ${transaction.type === "earn" ? "text-green-500" : "text-red-500"}`}
                          >
                            {transaction.type === "earn" ? "+" : "-"}
                            {transaction.amount}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1 uppercase">
                            {transaction.currency}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:text-[hsl(195_85%_28%)] hover:border-primary/50 hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.2)] transition-all"
                    >
                      <Link to={ROUTES.pricing}>View Pricing Plans</Link>
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Achievements
              </h3>
              {achievementsQuery.isPending ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-12 h-12 rounded-lg bg-primary/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-24 rounded bg-primary/10" />
                        <div className="h-2 w-36 rounded bg-primary/10" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !achievementsQuery.data?.length ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <Trophy className="w-10 h-10 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">No achievements yet</p>
                  <p className="text-xs text-muted-foreground/70">Keep surveying — your first badge is closer than you think!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {achievementsQuery.data.slice(0, 3).map((achievement) => {
                      const Icon = ACHIEVEMENT_ICONS[achievement.icon_name] ?? Award;
                      const gradient = CATEGORY_GRADIENT[achievement.category];
                      return (
                        <div key={achievement.id} className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-glow flex-shrink-0`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm">{achievement.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {achievement.description}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {achievementsQuery.data.length > 3 && (
                    <button
                      className="mt-4 w-full text-sm text-muted-foreground hover:text-primary focus:text-primary transition-colors duration-300 outline-none"
                      onClick={() => setAchievementsOpen(true)}
                    >
                      View all {achievementsQuery.data.length} achievements
                    </button>
                  )}
                </>
              )}
            </Card>

            {/* All Achievements Modal */}
            <Dialog open={achievementsOpen} onOpenChange={setAchievementsOpen}>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    All Achievements
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  {achievementsQuery.data?.map((achievement) => {
                    const Icon = ACHIEVEMENT_ICONS[achievement.icon_name] ?? Award;
                    const gradient = CATEGORY_GRADIENT[achievement.category];
                    return (
                      <div key={achievement.id} className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-glow flex-shrink-0`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm">{achievement.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {achievement.description}
                          </div>
                          {achievement.unlocked_at && (
                            <div className="text-xs text-muted-foreground/60 mt-0.5">
                              {new Date(achievement.unlocked_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>

            {/* Aggregation Rating */}
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Aggregation Rating
              </h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  92%
                </div>
                <p className="text-sm text-muted-foreground">
                  Your responses align well with community consensus
                </p>
              </div>
              <Progress value={92} className="h-3" />
            </Card>

            {/* Leaderboard */}
            <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Weekly Leaderboard
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Your rank
                  </span>
                  <Badge className="bg-gradient-primary">#24</Badge>
                </div>
                <div className="text-xs text-muted-foreground text-center py-2">
                  Top 5% of contributors this week
                </div>
              </div>
            </Card>
          </div>
        </div>
    </AppShell>
  );
};

export default Profile;
