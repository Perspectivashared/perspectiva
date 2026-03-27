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
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  defaultProfile,
  fetchUserProfile,
} from "@/features/profile/services/profile-service";
import { AppShell } from "@/shared/components/layout/AppShell";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";

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

const Profile = () => {
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
  const user = profileQuery.data ?? defaultProfile;

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
                    {user.role} • {user.institution}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {user.category}
                    </Badge>
                    <Badge className="bg-accent/10 text-accent border-accent/20">
                      {user.subCategory}
                    </Badge>
                    <Badge className="bg-success/10 text-success border-success/20">
                      Business
                    </Badge>
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
                <TabsTrigger value="saved">Saved</TabsTrigger>
                <TabsTrigger value="wallet">Wallet</TabsTrigger>
              </TabsList>

              <TabsContent value="created" className="space-y-4 mt-6">
                {surveysQuery.isPending ? (
                  <p className="text-muted-foreground text-sm">Loading surveys...</p>
                ) : surveysQuery.data?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No surveys created yet</div>
                ) : (
                  surveysQuery.data?.map((survey) => {
                    const progress = survey.target_responses
                      ? Math.min(100, Math.round((survey.response_count / survey.target_responses) * 100))
                      : 0;
                    return (
                      <Card
                        key={survey.id}
                        className="p-6 border-border/50 bg-card/50 backdrop-blur hover:shadow-elegant transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold mb-1">{survey.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {survey.category ?? "General"} • {new Date(survey.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={survey.status === "published" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}
                            >
                              {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                            </Badge>
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/surveys/${survey.id}/analytics`}>View Results & Statistics</Link>
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Responses</span>
                            <span className="font-medium">
                              {survey.response_count}{survey.target_responses ? `/${survey.target_responses}` : ""}
                            </span>
                          </div>
                          {survey.target_responses ? <Progress value={progress} className="h-2" /> : null}
                        </div>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4 mt-6">
                {completedQuery.isPending ? (
                  <p className="text-muted-foreground text-sm">Loading completed surveys...</p>
                ) : completedQuery.data?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No completed surveys yet</div>
                ) : (
                  completedQuery.data?.map((survey) => (
                    <Card
                      key={survey.id}
                      className="p-6 border-border/50 bg-card/50 backdrop-blur hover:shadow-elegant transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold mb-1">{survey.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {survey.category ?? "General"} •{" "}
                            {survey.published_at
                              ? new Date(survey.published_at).toLocaleDateString()
                              : new Date(survey.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-success/10 text-success border-success/20"
                        >
                          Completed
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Total responses</span>
                        <span className="font-medium">{survey.response_count}</span>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="saved" className="space-y-4 mt-6">
                {savedQuery.isPending ? (
                  <p className="text-muted-foreground text-sm">Loading saved surveys...</p>
                ) : savedQuery.data?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No saved surveys yet</div>
                ) : (
                  savedQuery.data?.map((survey) => {
                    const progress = survey.target_responses
                      ? Math.min(100, Math.round((survey.response_count / survey.target_responses) * 100))
                      : 0;
                    return (
                      <Card
                        key={survey.id}
                        className="p-6 border-border/50 bg-card/50 backdrop-blur hover:shadow-elegant transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold mb-1">{survey.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {survey.category ?? "General"}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={survey.status === "published" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}
                          >
                            {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Responses</span>
                            <span className="font-medium">
                              {survey.response_count}{survey.target_responses ? `/${survey.target_responses}` : ""}
                            </span>
                          </div>
                          {survey.target_responses ? <Progress value={progress} className="h-2" /> : null}
                        </div>
                      </Card>
                    );
                  })
                )}
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
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-glow">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Survey Master</div>
                    <div className="text-xs text-muted-foreground">
                      Complete 50 surveys
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-glow">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      Precision Responder
                    </div>
                    <div className="text-xs text-muted-foreground">
                      95%+ aggregation rate
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-glow">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Quick Contributor</div>
                    <div className="text-xs text-muted-foreground">
                      Complete 10 surveys in a week
                    </div>
                  </div>
                </div>
              </div>
            </Card>

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
